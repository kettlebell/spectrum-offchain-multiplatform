use std::collections::HashMap;
use std::fmt::Debug;

use log::{trace, warn};

use spectrum_offchain::data::unique_entity::{Confirmed, Predicted, Traced, Unconfirmed};
use spectrum_offchain::data::{EntitySnapshot, Stable};

pub mod kv_store;

pub trait StateIndex<Src: EntitySnapshot> {
    /// Get state id preceding given predicted state.
    fn get_prediction_predecessor<'a>(&self, id: Src::Version) -> Option<Src::Version>;
    /// Get last confirmed state of the given entity.
    fn get_last_confirmed<'a>(&self, id: Src::StableId) -> Option<Confirmed<Src>>;
    /// Get last unconfirmed state of the given entity.
    fn get_last_unconfirmed<'a>(&self, id: Src::StableId) -> Option<Unconfirmed<Src>>;
    /// Persist confirmed state of the entity.
    fn put_confirmed<'a>(&mut self, entity: Confirmed<Src>);
    /// Persist unconfirmed state of the entity.
    fn put_unconfirmed<'a>(&mut self, entity: Unconfirmed<Src>);
    /// Invalidate particular state of the entity.
    fn invalidate<'a>(&mut self, ver: Src::Version) -> Option<Src::StableId>;
    /// Invalidate particular state of the entity.
    fn eliminate<'a>(&mut self, ver: Src::Version);
    /// False-positive analog of `exists()`.
    fn may_exist<'a>(&self, sid: Src::Version) -> bool;
    fn get_state<'a>(&self, sid: Src::Version) -> Option<Src>;
}

#[derive(Clone)]
pub struct StateIndexTracing<In>(pub In);

impl<In, Src> StateIndex<Src> for StateIndexTracing<In>
where
    In: StateIndex<Src>,
    Src: EntitySnapshot,
{
    fn get_prediction_predecessor<'a>(&self, id: Src::Version) -> Option<Src::Version> {
        let res = self.0.get_prediction_predecessor(id);
        trace!(
            "get_prediction_predecessor({}) -> {}",
            id,
            if res.is_some() { "Some(_)" } else { "None" }
        );
        res
    }

    fn get_last_confirmed<'a>(&self, id: Src::StableId) -> Option<Confirmed<Src>> {
        let res = self.0.get_last_confirmed(id);
        trace!(
            "get_last_confirmed({}) -> {}",
            id,
            if res.is_some() { "Some(_)" } else { "None" }
        );
        res
    }

    fn get_last_unconfirmed<'a>(&self, id: Src::StableId) -> Option<Unconfirmed<Src>> {
        let res = self.0.get_last_unconfirmed(id);
        trace!(
            "get_last_unconfirmed({}) -> {}",
            id,
            if res.is_some() { "Some(_)" } else { "None" }
        );
        res
    }

    fn put_confirmed<'a>(&mut self, entity: Confirmed<Src>) {
        trace!(
            "put_confirmed(Entity({}, {}))",
            entity.0.stable_id(),
            entity.0.version()
        );
        self.0.put_confirmed(entity);
    }

    fn put_unconfirmed<'a>(&mut self, entity: Unconfirmed<Src>) {
        trace!(
            "put_unconfirmed(Entity({}, {}))",
            entity.0.stable_id(),
            entity.0.version()
        );
        self.0.put_unconfirmed(entity);
    }

    fn invalidate<'a>(&mut self, ver: Src::Version) -> Option<Src::StableId> {
        let res = self.0.invalidate(ver);
        trace!(
            "invalidate({}) -> {}",
            ver,
            if res.is_some() { "Some(_)" } else { "None" }
        );
        res
    }

    fn eliminate<'a>(&mut self, ver: Src::Version) {
        self.0.eliminate(ver);
        trace!("eliminate({})", ver);
    }

    fn may_exist<'a>(&self, sid: Src::Version) -> bool {
        let res = self.0.may_exist(sid);
        trace!("may_exist({}) -> {}", sid, res);
        res
    }

    fn get_state<'a>(&self, sid: Src::Version) -> Option<Src> {
        let res = self.0.get_state(sid);
        trace!(
            "get_state({}) -> {}",
            sid,
            if res.is_some() { "Some(_)" } else { "None" }
        );
        res
    }
}

#[derive(Debug, Clone)]
pub struct InMemoryStateIndex<T: EntitySnapshot> {
    store: HashMap<T::Version, T>,
    index: HashMap<InMemoryIndexKey, T::Version>,
    links: HashMap<T::Version, T::Version>,
}

impl<T: EntitySnapshot> InMemoryStateIndex<T> {
    pub fn new() -> Self {
        Self {
            store: HashMap::new(),
            links: HashMap::new(),
            index: HashMap::new(),
        }
    }
}

type InMemoryIndexKey = [u8; 29];

const LAST_CONFIRMED_PREFIX: u8 = 3u8;
const LAST_UNCONFIRMED_PREFIX: u8 = 4u8;

impl<T> StateIndex<T> for InMemoryStateIndex<T>
where
    T: EntitySnapshot + Clone,
    <T as EntitySnapshot>::Version: Copy + Debug,
    <T as Stable>::StableId: Copy + Into<[u8; 28]>,
{
    fn get_prediction_predecessor(&self, id: T::Version) -> Option<T::Version> {
        self.links.get(&id).map(|id| *id)
    }

    fn get_last_confirmed(&self, id: T::StableId) -> Option<Confirmed<T>> {
        let index_key = index_key(LAST_CONFIRMED_PREFIX, id);
        self.index
            .get(&index_key)
            .and_then(|sid| self.store.get(sid))
            .map(|e| Confirmed(e.clone()))
    }

    fn get_last_unconfirmed(&self, id: T::StableId) -> Option<Unconfirmed<T>> {
        let index_key = index_key(LAST_UNCONFIRMED_PREFIX, id);
        self.index
            .get(&index_key)
            .and_then(|sid| self.store.get(sid))
            .map(|e| Unconfirmed(e.clone()))
    }

    fn put_confirmed(&mut self, Confirmed(entity): Confirmed<T>) {
        let index_key = index_key(LAST_CONFIRMED_PREFIX, entity.stable_id());
        self.index.insert(index_key, entity.version());
        self.store.insert(entity.version(), entity);
    }

    fn put_unconfirmed(&mut self, Unconfirmed(entity): Unconfirmed<T>) {
        let index_key = index_key(LAST_UNCONFIRMED_PREFIX, entity.stable_id());
        self.index.insert(index_key, entity.version());
        self.store.insert(entity.version(), entity);
    }

    fn invalidate(&mut self, ver: T::Version) -> Option<T::StableId> {
        let predecessor = self.get_prediction_predecessor(ver);
        if let Some(entity) = self.store.remove(&ver) {
            let id = entity.stable_id();
            let last_confirmed_index_key = index_key(LAST_CONFIRMED_PREFIX, id);
            let last_unconfirmed_index_key = index_key(LAST_UNCONFIRMED_PREFIX, id);
            if let Some(predecessor) = predecessor {
                warn!(target: "entity_repo", "invalidating entity: rollback to {:?}", predecessor);
                warn!(target: "entity_repo", "invalidating entity: rollback to {:?}", predecessor);
                self.index.insert(last_confirmed_index_key, predecessor);
            } else {
                self.index.remove(&last_confirmed_index_key);
            }
            self.index.remove(&last_unconfirmed_index_key);
            self.links.remove(&ver);
            return Some(id);
        }
        None
    }

    fn eliminate(&mut self, ver: T::Version) {
        if let Some(entity) = self.store.remove(&ver) {
            let id = entity.stable_id();
            let last_confirmed_index_key = index_key(LAST_CONFIRMED_PREFIX, id);
            let last_unconfirmed_index_key = index_key(LAST_UNCONFIRMED_PREFIX, id);
            self.index.remove(&last_confirmed_index_key);
            self.index.remove(&last_unconfirmed_index_key);
            self.links.remove(&ver);
        }
    }

    fn may_exist(&self, sid: T::Version) -> bool {
        self.store.contains_key(&sid)
    }

    fn get_state(&self, sid: T::Version) -> Option<T> {
        self.store.get(&sid).map(|e| e.clone())
    }
}

pub fn index_key<T: Into<[u8; 28]>>(prefix: u8, id: T) -> InMemoryIndexKey {
    let mut arr = [prefix; 29];
    let raw_id: [u8; 28] = id.into();
    for (ix, byte) in raw_id.into_iter().enumerate() {
        arr[ix + 1] = byte;
    }
    arr
}

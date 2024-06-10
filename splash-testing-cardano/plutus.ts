// deno-lint-ignore-file
import {
  applyParamsToScript,
  Data,
  Validator,
} from "https://deno.land/x/lucid@0.10.7/mod.ts";

export interface IBeaconBeacon {
  new (
    ref: { transactionId: { hash: string }; outputIndex: bigint },
  ): Validator;
  _: Data;
}

export const BeaconBeacon = Object.assign(
  function (ref: { transactionId: { hash: string }; outputIndex: bigint }) {
    return {
      type: "PlutusV2",
      script: applyParamsToScript(
        "5901f001000032323232323232323222253330063253330073370e90001803000899191919299980599b88480000044c94ccc030cdc3a40006016002266ebcc00cc028c044c02800402458ccc8c0040048894ccc044008530103d87a80001323253330103370e0069000099ba548000cc0500092f5c0266600a00a00266e0400d2002301500330130023758600460126004601200c90000a5132323232533300e3370e90010008a400026eb4c04cc030008c030004c94ccc034cdc3a40040022980103d87a8000132323300100100222533301300114c103d87a800013232323253330143371e91101010000213374a90001980c1ba80014bd700998030030019bad3015003375c6026004602e004602a0026eacc048c02c008c02c004c8cc004004008894ccc0400045300103d87a800013232323253330113371e012004266e95200033015374c00297ae0133006006003375660240066eb8c040008c050008c048004c8c8cc004004008894ccc04000452f5bded8c0264646464a66602266e3d221000021003133015337606ea4008dd3000998030030019bab3012003375c6020004602800460240026eacc03cc040c040c040c040c020c004c0200148c03c004dd7180680098028008b1805980618020008a4c26cac4600a6ea80048c00cdd5000ab9a5573aaae7955cfaba05742ae881",
        [ref],
        {
          "dataType": "list",
          "items": [{
            "title": "OutputReference",
            "description":
              "An `OutputReference` is a unique reference to an output on-chain. The `output_index`\n corresponds to the position in the output list of the transaction (identified by its id)\n that produced that output",
            "anyOf": [{
              "title": "OutputReference",
              "dataType": "constructor",
              "index": 0,
              "fields": [{
                "title": "transactionId",
                "description":
                  "A unique transaction identifier, as the hash of a transaction body. Note that the transaction id\n isn't a direct hash of the `Transaction` as visible on-chain. Rather, they correspond to hash\n digests of transaction body as they are serialized on the network.",
                "anyOf": [{
                  "title": "TransactionId",
                  "dataType": "constructor",
                  "index": 0,
                  "fields": [{ "dataType": "bytes", "title": "hash" }],
                }],
              }, { "dataType": "integer", "title": "outputIndex" }],
            }],
          }],
        },
      ),
    };
  },
  { _: { "title": "Data", "description": "Any Plutus data." } },
) as unknown as IBeaconBeacon;

export interface ILiquidityLockerLiquidityLocker {
  new (): Validator;
  conf: { lockedUntil: bigint; redeemer: string };
  successorIx: bigint;
}

export const LiquidityLockerLiquidityLocker = Object.assign(
  function () {
    return {
      type: "PlutusV2",
      script:
        "5903f6010000323232323232323232222323232533300932323232533300d3370e90011806000899191919299980899b8748000c0400044c8c8c8c8c8c94ccc05ccdc3a4000602c002264646464a66603600220042940cc88c8cc00400400c894ccc08400452809919299981019b8f00200514a2266008008002604a0046eb8c08c004dd6180f98101810181018101810181018101810180c1805980c00a9bae3007301801753330193375e6014602e00a6014602e002264a66603466e1d2004301900113232323232325333020002100114a066e24dd69808180e80e1bad3010301d00432323300100100222533302400114a226464a666046646464646466e24004c8c8c94ccc0accdc3a40040022900009bad30303029002302900132533302a3370e90010008a60103d87a8000132323300100100222533303000114c103d87a800013232323253330313371e018004266e95200033035375000297ae0133006006003375a60640066eb8c0c0008c0d0008c0c8004dd598179814001181400099198008008061129998168008a6103d87a8000132323232533302e3371e016004266e95200033032374c00297ae01330060060033756605e0066eb8c0b4008c0c4008c0bc004dd6981600098160011bae302a001302a003375c60500042660080080022940c0a0008dd618130009919198008008011129998120008a5eb804c8ccc888c8cc00400400c894ccc0a8004400c4c8cc0b0dd3998161ba90063302c37526eb8c0a4004cc0b0dd41bad302a0014bd7019801801981700118160009bae302300137566048002660060066050004604c0026eacc02cc070028dd59805180d802980b0009810000980c0008b1802180b800899911919299980e99b87480080044c8c94ccc07ccdc3a400460406ea8c030c074c040c0740184cdc4002800899b89005001375a604600260360042940c06c004c030c064c030c064008c078c07cc07cc07cc07cc07cc07cc07cc05c03cdd69805180b80b180e800980a8008b19991800800911299980e0010a6103d87a800013232533301b3370e0069000099ba548000cc07c0092f5c0266600a00a00266e0400d20023020003301e00237586002602801801c460366038603800260026024004460326034002602e002601e0022c64646600200200444a66602c0022980103d87a80001323253330153375e600c602600400e266e952000330190024bd70099802002000980d001180c0009bac3001300e006230150013013001300b0011630110013011002300f001300700414984d958dd68021800802119299980419b87480000044c8c8c8c94ccc03cc04800852616375c602000260200046eb4c038004c01800858c0180048c014dd5000918019baa0015734aae7555cf2ab9f5740ae855d11",
    };
  },
  {
    conf: {
      "title": "Config",
      "anyOf": [{
        "title": "Config",
        "dataType": "constructor",
        "index": 0,
        "fields": [{ "dataType": "integer", "title": "lockedUntil" }, {
          "dataType": "bytes",
          "title": "redeemer",
        }],
      }],
    },
  },
  { successorIx: { "dataType": "integer" } },
) as unknown as ILiquidityLockerLiquidityLocker;

export interface IAuctionAuction {
  new (): Validator;
  conf: {
    base: { policy: string; name: string };
    quote: { policy: string; name: string };
    priceStart: { num: bigint; denom: bigint };
    startTime: bigint;
    stepLen: bigint;
    steps: bigint;
    priceDacayNum: bigint;
    feePerQuote: { num: bigint; denom: bigint };
    redeemer: string;
  };
  action: { Exec: { spanIx: bigint; successorIx: bigint } } | "Cancel";
}

export const AuctionAuction = Object.assign(
  function () {
    return {
      type: "PlutusV2",
      script:
        "5906bc01000032323232323232323222232325333008323232533300b3370e900000189919191919191919299980999b8748008c0480044c8c8c94ccc058cdc3a4000602a0022646464646464646464646464a66604466e1d2000302100113232323232323232323232323232323232323232323232533303953330395333039533303901b100114a0200e2940400852808040a503232533303a3370e900000089919299981e19b8f375c60666074072002266e1c04d200014a06eb8c100004c0e00084cdd79818181c00d9818181c00b981c0009817181b1817181b00a99b873370401200266e0801c008ccc00800cdd6980c981a180b181a0199119b82002483403cccc004008dd698159819980a98198191119b82002375a6078607a607a607a607a607a607a606a06844464666002002008006444a66607a004200226660060066080004660080026eb4c0fc008c8cc004005200022533303533710052002297ae013303937500026600400466e0000520023371090000022999818a9998188030a51100514a2266e24c8cdc098009bab3015303001330013756602a606001e466601800291100488100002533303000413370266e0402401c0044cdc080480399b83337040026eb4c094c0b4008dd6980918168012999817001899b833370466e04010018dd69808981600099b80375a602260580026eb4c090c0b00044cdc08020031809181581519b8f008489003371e00c9101003330043756601a605000e00a6eb8c034c0a0c034c0a009cccc00cdd5980618138030029bae300c3027301f302702633300237566016604c0120066eb8c02cc098c02cc098094ccc004dd5980518128040019bae300a3025301d3025024222323232533302c3370e90010008a400026eb4c0c4c0a8008c0a8004c94ccc0accdc3a4004002298103d87a8000132323300100100222533303100114c103d87a800013232323253330323371e014004266e95200033036375000297ae0133006006003375a60660066eb8c0c4008c0d4008c0cc004dd598181814801181480099198008008021129998170008a6103d87a8000132323232533302f3371e010004266e95200033033374c00297ae0133006006003375660600066eb8c0b8008c0c8008c0c0004dd7180d9811980418118111bae301a3022301a3022021302800130200011633323001001222533302700214c0103d87a80001323253330263370e0069000099ba548000cc0a80092f5c0266600a00a00266e0400d2002302b003302900237586002603e0220264604c604e604e0026004603a010a66603ca66603c66e20048dd6981198121812181218121812180e00d89919299981019b87480080044c8c94ccc088cdc3a400460466ea8c014c080c060c0800184cdc4004800899b89009001375a604c002603c0042940c078004c050c070c050c07000852809919299981019b87480080044c8c94ccc088cdc3a400460466ea8c014c080c014c0800184cdc4000804099b89001008375a604c002603c0042940c078004c050c070c004c0700085281181198120009800980d00611810981118111811181118111811181100099b80001002337006eb4c078c07cc07cc07cc05c058cdc10008069bad301d301e301e301e301e3016015301c00130140011632323300100100222533301b00114c103d87a800013232533301a3375e6020603000400c266e9520003301e0024bd70099802002000980f801180e8009bac300b30130053019001301100116301700130170023015001300d00a375a602600260260046eb4c044004c02401c4cc88c8cc00400400c894ccc04800452809919299980899b8f00200514a2266008008002602c0046eb8c050004dd618011804980098048031bae30023009008230100012300f30103010301030103010301030103010001300700414984d958c94ccc020cdc3a4000002264646464a66601e60240042930b1bad30100013010002375a601c002600c0082a66601066e1d20020011533300b300600414985858c01800cc8c8c94ccc024cdc3a40000022646464646464646464646464646464646464a66603c604200426464646493180b803180b007980b008180a8088b1bae301f001301f002301d001301d002375a603600260360046eb4c064004c064008dd6980b800980b8011bad301500130150023013001301300230110013011002300f001300700616300700523253330093370e9000000899191919299980818098010a4c2c6eb4c044004c044008dd6980780098038010b1803800919299980419b87480000044c8c8c8c94ccc03cc04800852616375c602000260200046eb8c038004c01800858c0180048c014dd5000918019baa0015734aae7555cf2ab9f5740ae855d11",
    };
  },
  {
    conf: {
      "title": "Config",
      "anyOf": [{
        "title": "Config",
        "dataType": "constructor",
        "index": 0,
        "fields": [
          {
            "title": "base",
            "anyOf": [{
              "title": "Asset",
              "dataType": "constructor",
              "index": 0,
              "fields": [{ "dataType": "bytes", "title": "policy" }, {
                "dataType": "bytes",
                "title": "name",
              }],
            }],
          },
          {
            "title": "quote",
            "anyOf": [{
              "title": "Asset",
              "dataType": "constructor",
              "index": 0,
              "fields": [{ "dataType": "bytes", "title": "policy" }, {
                "dataType": "bytes",
                "title": "name",
              }],
            }],
          },
          {
            "title": "priceStart",
            "anyOf": [{
              "title": "Rational",
              "dataType": "constructor",
              "index": 0,
              "fields": [{ "dataType": "integer", "title": "num" }, {
                "dataType": "integer",
                "title": "denom",
              }],
            }],
          },
          { "dataType": "integer", "title": "startTime" },
          { "dataType": "integer", "title": "stepLen" },
          { "dataType": "integer", "title": "steps" },
          { "dataType": "integer", "title": "priceDacayNum" },
          {
            "title": "feePerQuote",
            "anyOf": [{
              "title": "Rational",
              "dataType": "constructor",
              "index": 0,
              "fields": [{ "dataType": "integer", "title": "num" }, {
                "dataType": "integer",
                "title": "denom",
              }],
            }],
          },
          { "dataType": "bytes", "title": "redeemer" },
        ],
      }],
    },
  },
  {
    action: {
      "title": "Action",
      "anyOf": [{
        "title": "Exec",
        "description": "Execute order",
        "dataType": "constructor",
        "index": 0,
        "fields": [{ "dataType": "integer", "title": "spanIx" }, {
          "dataType": "integer",
          "title": "successorIx",
        }],
      }, {
        "title": "Cancel",
        "dataType": "constructor",
        "index": 1,
        "fields": [],
      }],
    },
  },
) as unknown as IAuctionAuction;

export interface ILimitOrderBatchWitness {
  new (): Validator;
  _: Data;
}

export const LimitOrderBatchWitness = Object.assign(
  function () {
    return {
      type: "PlutusV2",
      script:
        "590776010000323232323232323232225333005323253330073370e900218030008991919191999911119199980080080280225122225333016003100113232533301800414a0264646666010010006002a66602e00a26660120080040142940c070014c068010c068010c06000cdd6180218048019bac3001300900337586004601200664646464644446464a66602a66e1d2004301400113232323232533301a3375e00298010241000013232323232323232323232323232323232323232323232323232323232323232323232533303d002100114a064a66608000229444c8c8cc00400400c894ccc10c00452809919299982119b8f00200514a2266008008002608e0046eb8c114004dd718210159bac304130423042304230423042304230423042304230423042303a026533303b0011323232533303e002100114a0a66607a034266e2402ccdc019b800080070091533303d0191337120160102a66607a66e2402c0204cdc499b8148000028cdc00038048a503371266e0801cdd6981a981d00299b82001375a606e607400aa66607602e266e00cdc00050028038805099299981e19b8748010c0ec0044c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c94ccc1314ccc1314ccc1314ccc1314ccc130020401c52808030a50100414a020062940400452819baf00e001323232323232323374a90001982a982b0039982a982b0031982a982b0029982a9ba801233055305600433055305600333055305600233055305600133055375002060ae60ae00260ac00260aa00260a800260a660a600260a400260a2002609006866ebc044040cdc48008029bad304c304d304d304d304d304d3045031533304602313371202866e00cdc00030020090a999823011099b89014006153330463371202800c266e24cdc0a400002666e0001004852819b890033370666e0801403c040cdc499b82004375a607a608401a66e08004dd6981f9821006a99982180f899b803370002400201e202466e04030004dd6981c181f80219b8100b001375a6060607a0046062002608400260740022c6062607205466ebc004c0fcc100c100c100c100c100c100c100c100c100c0e0090c0c8c0dc0a0c0c4c0d8094c0f0c0f4c0f4c0f4c0f4c0f4c0f4c0f4c0d4084dd69816981a0101bad3026303301f375a60726074607460746074606403c66e0401c02ccdc080280199b81001003533303000c10041333302200600f00e480194ccc0bc030400c4cccc08401404003d2006533302e00a10061333302000800d00c480194ccc0b402840144cccc07c01c0380352006375a605c00260606eacc0b4008c0c0038c0b8034dd6981500098161bab3029002302c00b302a00a3371e0069101003371e008910100375c603a60400086eb8c068c07c00cdd7180d980f0019bae3018301d0023023302430243024302430243024301c0083013301b0073756602e60340166eacc058c064020c034010528980f0009bac301a00132337606ea0c064004dd3980d0009baa001301b001301300116300a3012001300e30110032301530163016301600122223233300100100500222253330153371090000008a99980c0010a4000264646464a66603266e3c0080284c8c8c8c94ccc074cdc780100688008a9998100018a4000264a6660420022646464a66604266e3c004044400852000375c60420046eb4c084004c08c01058c08c00cdd6980f0019bae301c0023020002301e00113330070070033370200a90011bab301a003375c6030004603800660340042c464a66601e66e1d20000011323232323232323232323232323232323232323232323232533302a302d00213232323232498c8cc004004018894ccc0c0004526132330030033034002375c606400264a66605666e1d20000011323232325333032303500213232498c94ccc0c4cdc3a400000226464a66606c60720042649319299981a19b87480000044c8c94ccc0e4c0f00084c926302b00116303a0013032002153330343370e90010008991919191919299981e98200010a4c2c6eb4c0f8004c0f8008dd6981e000981e0011bad303a0013032002163032001163037001302f003153330313370e90010008a99981a18178018a4c2c2c605e00460480062c60660026066004606200260520122c605201064a66605466e1d200000113232323253330313034002149858dd6981900098190011bad3030001302800c16302800b301c00c301b013163758605600260560046eb8c0a4004c0a4008c09c004c09c008dd69812800981280118118009811801181080098108011bad301f001301f002375a603a002603a0046eb4c06c004c06c008c064004c064008dd7180b800980b8011bae3015001300d00216300d001232533300e3370e9000000899191919299980a980c0010a4c2c6eb8c058004c058008dd7180a00098060010b1806000919299980699b87480000044c8c94ccc048c05400852616375c602600260160042a66601a66e1d20020011323253330123015002149858dd7180980098058010b18058009180818089808800918079808180818081808180818081808180800098009803002118068008b180098020011180598060008a4c26cac4600a6ea80048c00cdd5000ab9a5573aaae7955cfaba05742ae89",
    };
  },
  { _: { "title": "Data", "description": "Any Plutus data." } },
) as unknown as ILimitOrderBatchWitness;

export interface ILimitOrderLimitOrder {
  new (
    witness: {
      Inline: [
        { VerificationKeyCredential: [string] } | {
          ScriptCredential: [string];
        },
      ];
    } | {
      Pointer: {
        slotNumber: bigint;
        transactionIndex: bigint;
        certificateIndex: bigint;
      };
    },
  ): Validator;
  conf: {
    tag: string;
    beacon: string;
    input: { policy: string; name: string };
    tradableInput: bigint;
    costPerExStep: bigint;
    minMarginalOutput: bigint;
    output: { policy: string; name: string };
    basePrice: { num: bigint; denom: bigint };
    fee: bigint;
    redeemerAddress: {
      paymentCredential: { VerificationKeyCredential: [string] } | {
        ScriptCredential: [string];
      };
      stakeCredential: {
        Inline: [
          { VerificationKeyCredential: [string] } | {
            ScriptCredential: [string];
          },
        ];
      } | {
        Pointer: {
          slotNumber: bigint;
          transactionIndex: bigint;
          certificateIndex: bigint;
        };
      } | null;
    };
    cancellationPkh: string;
    permittedExecutors: Array<string>;
  };
  action: boolean;
}

export const LimitOrderLimitOrder = Object.assign(
  function (
    witness: {
      Inline: [
        { VerificationKeyCredential: [string] } | {
          ScriptCredential: [string];
        },
      ];
    } | {
      Pointer: {
        slotNumber: bigint;
        transactionIndex: bigint;
        certificateIndex: bigint;
      };
    },
  ) {
    return {
      type: "PlutusV2",
      script: applyParamsToScript(
        "5903e60100003232323232323232322222323253330093232533300b003132323300100100222533301100114a02646464a66602266ebc0380045288998028028011808801180a80118098009bab301030113011301130113011301130090011323232533300e3370e900118068008991919299980899b8748000c0400044c8c8c8c8c94ccc0594ccc05802c400852808008a503375e601860260046034603660366036603660366036603660366036602602266ebcc020c048c020c048008c020c048004c060dd6180c180c980c9808804980b80098078008b19191980080080111299980b0008a6103d87a80001323253330153375e6018602600400c266e952000330190024bd70099802002000980d001180c0009bac3007300e0063014001300c001163001300b0072301230130013322323300100100322533301200114a026464a66602266e3c008014528899802002000980b0011bae3014001375860206022602260226022602260226022602260120026eb8c040c044c044c044c044c044c044c044c044c044c044c02401cc004c0200108c03c004526136563370e900118049baa003323232533300a3370e90000008991919191919191919191919191919191919191919191919299981298140010991919191924c646600200200c44a6660560022930991980180198178011bae302d0013253330263370e9000000899191919299981698180010991924c64a66605866e1d20000011323253330313034002132498c94ccc0bccdc3a400000226464a666068606e0042649318150008b181a80098168010a99981799b87480080044c8c8c8c8c8c94ccc0e0c0ec00852616375a607200260720046eb4c0dc004c0dc008dd6981a80098168010b18168008b181900098150018a99981619b874800800454ccc0bcc0a800c5261616302a002302300316302e001302e002302c00130240091630240083253330253370e9000000899191919299981618178010a4c2c6eb4c0b4004c0b4008dd6981580098118060b1811805980d806180d0098b1bac30260013026002375c60480026048004604400260440046eb4c080004c080008c078004c078008c070004c070008dd6980d000980d0011bad30180013018002375a602c002602c004602800260280046eb8c048004c048008dd7180800098040030b1804002919299980519b87480000044c8c8c8c94ccc044c05000852616375c602400260240046eb8c040004c02000858c0200048c94ccc024cdc3a400000226464a66601c60220042930b1bae300f0013007002153330093370e900100089919299980718088010a4c2c6eb8c03c004c01c00858c01c0048c014dd5000918019baa0015734aae7555cf2ab9f5740ae855d11",
        [witness],
        {
          "dataType": "list",
          "items": [{
            "title": "Referenced",
            "description":
              "Represent a type of object that can be represented either inline (by hash)\n or via a reference (i.e. a pointer to an on-chain location).\n\n This is mainly use for capturing pointers to a stake credential\n registration certificate in the case of so-called pointer addresses.",
            "anyOf": [{
              "title": "Inline",
              "dataType": "constructor",
              "index": 0,
              "fields": [{
                "description":
                  "A general structure for representing an on-chain `Credential`.\n\n Credentials are always one of two kinds: a direct public/private key\n pair, or a script (native or Plutus).",
                "anyOf": [{
                  "title": "VerificationKeyCredential",
                  "dataType": "constructor",
                  "index": 0,
                  "fields": [{ "dataType": "bytes" }],
                }, {
                  "title": "ScriptCredential",
                  "dataType": "constructor",
                  "index": 1,
                  "fields": [{ "dataType": "bytes" }],
                }],
              }],
            }, {
              "title": "Pointer",
              "dataType": "constructor",
              "index": 1,
              "fields": [{ "dataType": "integer", "title": "slotNumber" }, {
                "dataType": "integer",
                "title": "transactionIndex",
              }, { "dataType": "integer", "title": "certificateIndex" }],
            }],
          }],
        },
      ),
    };
  },
  {
    conf: {
      "title": "LimitOrderConfig",
      "anyOf": [{
        "title": "LimitOrderConfig",
        "dataType": "constructor",
        "index": 0,
        "fields": [
          { "dataType": "bytes", "title": "tag" },
          { "dataType": "bytes", "title": "beacon" },
          {
            "title": "input",
            "anyOf": [{
              "title": "Asset",
              "dataType": "constructor",
              "index": 0,
              "fields": [{ "dataType": "bytes", "title": "policy" }, {
                "dataType": "bytes",
                "title": "name",
              }],
            }],
          },
          { "dataType": "integer", "title": "tradableInput" },
          { "dataType": "integer", "title": "costPerExStep" },
          { "dataType": "integer", "title": "minMarginalOutput" },
          {
            "title": "output",
            "anyOf": [{
              "title": "Asset",
              "dataType": "constructor",
              "index": 0,
              "fields": [{ "dataType": "bytes", "title": "policy" }, {
                "dataType": "bytes",
                "title": "name",
              }],
            }],
          },
          {
            "title": "basePrice",
            "anyOf": [{
              "title": "Rational",
              "dataType": "constructor",
              "index": 0,
              "fields": [{ "dataType": "integer", "title": "num" }, {
                "dataType": "integer",
                "title": "denom",
              }],
            }],
          },
          { "dataType": "integer", "title": "fee" },
          {
            "title": "redeemerAddress",
            "description":
              "A Cardano `Address` typically holding one or two credential references.\n\n Note that legacy bootstrap addresses (a.k.a. 'Byron addresses') are\n completely excluded from Plutus contexts. Thus, from an on-chain\n perspective only exists addresses of type 00, 01, ..., 07 as detailed\n in [CIP-0019 :: Shelley Addresses](https://github.com/cardano-foundation/CIPs/tree/master/CIP-0019/#shelley-addresses).",
            "anyOf": [{
              "title": "Address",
              "dataType": "constructor",
              "index": 0,
              "fields": [{
                "title": "paymentCredential",
                "description":
                  "A general structure for representing an on-chain `Credential`.\n\n Credentials are always one of two kinds: a direct public/private key\n pair, or a script (native or Plutus).",
                "anyOf": [{
                  "title": "VerificationKeyCredential",
                  "dataType": "constructor",
                  "index": 0,
                  "fields": [{ "dataType": "bytes" }],
                }, {
                  "title": "ScriptCredential",
                  "dataType": "constructor",
                  "index": 1,
                  "fields": [{ "dataType": "bytes" }],
                }],
              }, {
                "title": "stakeCredential",
                "anyOf": [{
                  "title": "Some",
                  "description": "An optional value.",
                  "dataType": "constructor",
                  "index": 0,
                  "fields": [{
                    "description":
                      "Represent a type of object that can be represented either inline (by hash)\n or via a reference (i.e. a pointer to an on-chain location).\n\n This is mainly use for capturing pointers to a stake credential\n registration certificate in the case of so-called pointer addresses.",
                    "anyOf": [{
                      "title": "Inline",
                      "dataType": "constructor",
                      "index": 0,
                      "fields": [{
                        "description":
                          "A general structure for representing an on-chain `Credential`.\n\n Credentials are always one of two kinds: a direct public/private key\n pair, or a script (native or Plutus).",
                        "anyOf": [{
                          "title": "VerificationKeyCredential",
                          "dataType": "constructor",
                          "index": 0,
                          "fields": [{ "dataType": "bytes" }],
                        }, {
                          "title": "ScriptCredential",
                          "dataType": "constructor",
                          "index": 1,
                          "fields": [{ "dataType": "bytes" }],
                        }],
                      }],
                    }, {
                      "title": "Pointer",
                      "dataType": "constructor",
                      "index": 1,
                      "fields": [
                        { "dataType": "integer", "title": "slotNumber" },
                        { "dataType": "integer", "title": "transactionIndex" },
                        { "dataType": "integer", "title": "certificateIndex" },
                      ],
                    }],
                  }],
                }, {
                  "title": "None",
                  "description": "Nothing.",
                  "dataType": "constructor",
                  "index": 1,
                  "fields": [],
                }],
              }],
            }],
          },
          { "dataType": "bytes", "title": "cancellationPkh" },
          {
            "dataType": "list",
            "items": { "dataType": "bytes" },
            "title": "permittedExecutors",
          },
        ],
      }],
    },
  },
  {
    action: {
      "title": "Bool",
      "anyOf": [{
        "title": "False",
        "dataType": "constructor",
        "index": 0,
        "fields": [],
      }, {
        "title": "True",
        "dataType": "constructor",
        "index": 1,
        "fields": [],
      }],
    },
  },
) as unknown as ILimitOrderLimitOrder;

export interface IDepositDeposit {
  new (): Validator;
  datum: {
    poolNft: { policy: string; name: string };
    redeemer: string;
    minExpectedLpAmount: bigint;
  };
  action: {
    ApplyOrder: {
      redeemerInIx: bigint;
      redeemerOutIx: bigint;
      poolInIx: bigint;
    };
  } | "CancelOrder";
}

export const DepositDeposit = Object.assign(
  function () {
    return {
      type: "PlutusV2",
      script:
        "5904ed01000032323232323232323222232323253330093232323232323232323232323232323253330193370e900000089919191919191919191919191919299981399b8748000c0980044c8c8c8c8c8c8c8c8c8c8c8c94ccc0cccdc3a4000606400226464646464646464a66607666e1d2004303a00113232533303d3370e9000181e00089919191919191919191919191919191919191919191919191919299982d182e8010991919191919191919191919299983199b8748000c1880044c8c8c8c8c8c8c8c8c8c8c94ccc1b94ccc1b8010400852808008a5032323253330703370e9000000899b8f059375c60ea60dc004266ebcc00cc1b8c0ecc1b8120028c1b8004c004c1b0c004c1b00288c1cc004cdc481f80099980100180600519b8733300103203b03948008888c8c8c94ccc1bccdc3a40040022900009bad3074306d002306d00132533306e3370e90010008a60103d87a8000132323300100100222533307400114c103d87a800013232323253330753371e014004266e95200033079375000297ae0133006006003375a60ec0066eb8c1d0008c1e0008c1d8004dd598399836001183600099198008008021129998388008a6103d87a800013232323253330723371e010004266e95200033076374c00297ae0133006006003375660e60066eb8c1c4008c1d4008c1cc004dd59836800983680118358009831800983480098308008b1981e81f8231bae30660013066002375c60c800260b80306600a01246eb4004cc0100308dd7000982a80a9980100b11bad001330010172305400122323300100100322533305f00114984c8cc00c00cc18c008c00cc184004c14406458dd6982d800982d8011bac30590013059002375c60ae00260ae0046eb0c154004c154008dd6982980098298011bad30510013051002375a609e002609e00466e1d200230493754609a002609a004609600260960046eb0c124004c124008dd6182380098238011bad304500130450023043001303b001163041001303900116303f001303f0023756607a002607a002606860026068004460766078002607200260620022c6601a0240286eb8c0d8004c0d8008dd7181a00098160021bad303200130320013031002302f0013027026302d0013025001163300100600c3001001222533302a00214c103d87a80001323253330293370e0069000099ba548000cc0b40092f5c0266600a00a00266e0400d2002302e003302c002375860500026050002604e0046eb0c094004c074054dd6981180098118011bad30210013021002375a603e002602e02a2646600200200c44a66603c00229404c8c94ccc074cdc78010030a511330040040013022002375c6040002602e0286eb8c070004c070004c04c048dd6180c800980c800980c000980b800980b000980a800980a000980980098090009804800980780098038020a4c26cac64a66601266e1d2000001132323232323253330123015002149858dd6980980098098011bad30110013011002375a601e002600e00a2a66601266e1d20020011533300c300700514985858c01c010c94ccc020cdc3a40000022646464646464a66602260280042649318040028b1bad30120013012002375c60200026020004601c002600c00a2c600c008464a66601066e1d2000001132323232533300f3012002149858dd7180800098080011bae300e0013006002163006001230053754002460066ea80055cd2ab9d5573caae7d5d02ba157441",
    };
  },
  {
    datum: {
      "title": "DepositData",
      "description": "AMM-orders data.",
      "anyOf": [{
        "title": "DepositData",
        "dataType": "constructor",
        "index": 0,
        "fields": [
          {
            "title": "poolNft",
            "anyOf": [{
              "title": "Asset",
              "dataType": "constructor",
              "index": 0,
              "fields": [{ "dataType": "bytes", "title": "policy" }, {
                "dataType": "bytes",
                "title": "name",
              }],
            }],
          },
          { "dataType": "bytes", "title": "redeemer" },
          { "dataType": "integer", "title": "minExpectedLpAmount" },
        ],
      }],
    },
  },
  {
    action: {
      "title": "OrderAction",
      "description": "Order action types.",
      "anyOf": [{
        "title": "ApplyOrder",
        "dataType": "constructor",
        "index": 0,
        "fields": [{ "dataType": "integer", "title": "redeemerInIx" }, {
          "dataType": "integer",
          "title": "redeemerOutIx",
        }, { "dataType": "integer", "title": "poolInIx" }],
      }, {
        "title": "CancelOrder",
        "dataType": "constructor",
        "index": 1,
        "fields": [],
      }],
    },
  },
) as unknown as IDepositDeposit;

export interface IPoolT2tValidateStablePoolTransitionT2t {
  new (daoVotingWitness: string): Validator;
  inputDatum: {
    poolNft: { policy: string; name: string };
    an2n: bigint;
    assetX: { policy: string; name: string };
    assetY: { policy: string; name: string };
    multiplierX: bigint;
    multiplierY: bigint;
    lpToken: { policy: string; name: string };
    amplCoeffIsEditable: boolean;
    lpFeeIsEditable: boolean;
    lpFeeNum: bigint;
    protocolFeeNum: bigint;
    daoStabeProxyWitness: string;
    treasuryAddress: string;
    protocolFeesX: bigint;
    protocolFeesY: bigint;
  };
  redeemer: {
    poolInIx: bigint;
    poolOutIx: bigint;
    action: { AMMAction: { contextValuesList: Array<bigint> } } | "PDAOAction";
  };
}

export const PoolT2tValidateStablePoolTransitionT2t = Object.assign(
  function (daoVotingWitness: string) {
    return {
      type: "PlutusV2",
      script: applyParamsToScript(
        "590b9a01000032323232323232323223222232323232533300c32323232323232323253330153370e9001180a00309919191919191919191919299981019b8748000c07c0044c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c94ccc118cdc3a4000608a002264646464646464646464a6660a066e1d2004304f00313232323232323232323232323232323232323232323232323232323232323232323232325333074533307453330745333074533307400b100a14a020082940400c52808010a50100114a064a6660e866e1d200000113232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323253330c601002100114a0a66618a0266618a0266e1c01120004a09444c8c8c8c8c94ccc32804008400452829998648099b894800001c4cdc4a400000c29414ccc32004cdc499b8200100f33704006016266e24cdc100080719b8200300a14a066e04004008cdc0a41fdfffffffffffffffe0200c66e0520feffffffffffffffff01006132323232323232323232323232323232323232323232323232323253330e0013370e9000186f808008991919299987180a9998718080388030a50100114a0646464646464646464a6661d60266e2520003370266e00020cdc1002805002099b893370266e00020cdc1001005000a40002940cdc119b820700023370066e08090070cdc101100619b820070013370466e08010068028cdc119b8206d0023370066e08084074cdc100f80d99b820040013370466e0800406c064cdc100f00e1983600119b80480112002337020d090041bad30e60100130de010011653330e20106a14c0103d87a800013374a9000198718098720083525eb80cdc099b8100e3370666e08028158cdc082b241813418900119b8700b0053371266e08cdc0a40000040a466e08018004cdc099b8148302683014c144dd6986f80800986f808011bad30dd0100130dd01002375a61b60200261b6020046eb4c36404004c36404008dd6986b80800986b808011bad30d50100130d501002375a61a60200261a6020046eb4c34404004c34404008dd69867808009867808011bad30cd0100130cd01002375a619602002a66618a0266e2120000071330c901375008666192026ea0114cc32404dd400599864809ba800c330c901375001266192026ea0028cc32404dd400399864809ba8008330c901375000666192026ea0034cc32404dd400725eb804cc32404dd402299864809ba8043330c901375001866192026ea002ccc32404dd400519864809ba8009330c901375001066192026ea001ccc32404dd400119864809ba800e330c901375001a97ae053330c40153330c40153330c4013370e094058266e1c0f008c528099b8703a02114a0266e3c0dc07852819b810190323370203406666e04004008ccc1441d40b40acccc140258040b00a8cdc080100219b810020043370200c02466e0401804ccdc080301499b8100602a3370200400866e04008010ccc11c1ac018010ccc1181a802401cccc11422c04010008ccc1102280401c014dd7185b80800985b808011bae30b50100130ad01031375c6166020026166020046eb8c2c404004c2a4040bcdd69857808009857808011bad30ad0100130ad01002375c6156020026156020026154020046eb4c2a004004c2a004008dd6985300800985300800985280800985200800985180800985100800985080800985000800984f808011bad309d01001309d01001309401045375c6134020026134020046eb8c26004004c24004038dd6984b00800984b008011bad309401001309401002375c6124020026124020026122020046eb4c23c04004c23c04008dd69846808009846808009846008009845808011844808009844808011bad308701001308701002375a610a02002610a020046106020026106020046102020026102020046eb4c1fc004c1fc004c1d81ccc0040048894ccc1e4cdc4000a4000290000a99983c99b870014800052002153330793370e66e180052004480004ccc00c00ccdc100100119b83001480104cdc100119980180199b820020023370666e04005200248010dd6183d000983902c099191919299983c00108008a50330023756600660ea0d40e6660026eacc008c1d01a40d888c8c8cc004004010894ccc1f40045280991919299983e99baf00600114a226600a00a00460fa00461020200460fe00266e9520003307b3374a90011983d9ba90014bd7025eb808c1e8c1ecc1ecc1ecc1ecc1ecc1ec004c1c815ccdd79ba702e374e03ea6660e2a6660e2a6660e2a6660e2a6660e2a6660e2a6660e2a6660e266ebc1100704cdd782080c8a5013375e07e02e29404cdc381e80a8a5013370e07602629404cdd781c8088a5015333071035100d133307100d4a09445280a99983881b88078999838807a504a229404cdc78188048a503370e66600204a0080049001111191919299983a99b8748008004520001375a60f460e600460e600264a6660e866e1d200200114c103d87a8000132323300100100222533307a00114c103d87a8000132323232533307b3371e014004266e9520003307f375000297ae0133006006003375a60f80066eb8c1e8008c1f8008c1f0004dd5983c98390011839000991980080080211299983b8008a6103d87a800013232323253330783371e010004266e9520003307c374c00297ae0133006006003375660f20066eb8c1dc008c1ec008c1e4004dd7183980098398011bae3071001306903e3375e07e03666ebc14c118dd7183680098368009836000983580119b8748008c194dd51834800983480119b8748008c18cdd518338009833801183280098328011bad30630013063002375a60c200260c200460be00260be00460ba00260ba00260b800460b400260a40066020010609200260ac002609c0062c60a8002609800a60a400260a40046eacc140004c140008c138004c118004c130004c11000458cc09c0c40acc00406c8c008004c004004894ccc11800452f5c026608e608860900026600400460920026eb8c114004c114004c110004c10c008cdc3a4004607a6ea8c104004c104008cdc3a400460766ea8c0fc004c0fc008c0f4004c0f4008dd6981d800981d8011bad30390013039002303700130370023035001303500130340023032001302a027303000130280033756605c002605c004605800260480026054002605400460500026040002604c002603c0022c6600201c00e6002002444a6660460042980103d87a80001323253330223370e0069000099ba548000cc0980092f5c0266600a00a00266e0400d20023027003302500230210013021002375a603e002603e0046eb4c074004c054044c06c004c04c01858dd6180c800980c800980c0011bac3016001300e003301400130140023012001300a00514984d958c94ccc030cdc3a40000022646464646464a66602a60300042649319299980999b87480000044c8c94ccc060c06c0084c926323300100100222533301a00114984c8cc00c00cc078008dd6980e0008b1bac30190013011002153330133370e90010008a99980b18088010a4c2c2c60220022c602c002602c0046eb4c050004c050008dd6980900098050030b18050029800802919299980599b87480000044c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c94ccc0b0c0bc0084c8c8c8c92630240143023019302201a302101d16375a605a002605a0046eb4c0ac004c0ac008dd7181480098148011bae30270013027002375a604a002604a0046eb4c08c004c08c008cdc3a4004603a6ea8c084004c084008cdc3a400460366ea8c07c004c07c008c074004c074008dd6980d800980d8011bad301900130190023017001301700230150013015002375a60260026026004602200260120042c6012002464a66601466e1d200000113232323253330113014002149858dd7180900098090011bae30100013008002163008001375c0024600a6ea80048c00cdd5000ab9a5573aaae7955cfaba05742ae89",
        [daoVotingWitness],
        { "dataType": "list", "items": [{ "dataType": "bytes" }] },
      ),
    };
  },
  {
    inputDatum: {
      "title": "PoolDataT2T",
      "description": "Pool data T2T.",
      "anyOf": [{
        "title": "PoolDataT2T",
        "dataType": "constructor",
        "index": 0,
        "fields": [
          {
            "title": "poolNft",
            "anyOf": [{
              "title": "Asset",
              "dataType": "constructor",
              "index": 0,
              "fields": [{ "dataType": "bytes", "title": "policy" }, {
                "dataType": "bytes",
                "title": "name",
              }],
            }],
          },
          { "dataType": "integer", "title": "an2n" },
          {
            "title": "assetX",
            "anyOf": [{
              "title": "Asset",
              "dataType": "constructor",
              "index": 0,
              "fields": [{ "dataType": "bytes", "title": "policy" }, {
                "dataType": "bytes",
                "title": "name",
              }],
            }],
          },
          {
            "title": "assetY",
            "anyOf": [{
              "title": "Asset",
              "dataType": "constructor",
              "index": 0,
              "fields": [{ "dataType": "bytes", "title": "policy" }, {
                "dataType": "bytes",
                "title": "name",
              }],
            }],
          },
          { "dataType": "integer", "title": "multiplierX" },
          { "dataType": "integer", "title": "multiplierY" },
          {
            "title": "lpToken",
            "anyOf": [{
              "title": "Asset",
              "dataType": "constructor",
              "index": 0,
              "fields": [{ "dataType": "bytes", "title": "policy" }, {
                "dataType": "bytes",
                "title": "name",
              }],
            }],
          },
          {
            "title": "amplCoeffIsEditable",
            "anyOf": [{
              "title": "False",
              "dataType": "constructor",
              "index": 0,
              "fields": [],
            }, {
              "title": "True",
              "dataType": "constructor",
              "index": 1,
              "fields": [],
            }],
          },
          {
            "title": "lpFeeIsEditable",
            "anyOf": [{
              "title": "False",
              "dataType": "constructor",
              "index": 0,
              "fields": [],
            }, {
              "title": "True",
              "dataType": "constructor",
              "index": 1,
              "fields": [],
            }],
          },
          { "dataType": "integer", "title": "lpFeeNum" },
          { "dataType": "integer", "title": "protocolFeeNum" },
          { "dataType": "bytes", "title": "daoStabeProxyWitness" },
          { "dataType": "bytes", "title": "treasuryAddress" },
          { "dataType": "integer", "title": "protocolFeesX" },
          { "dataType": "integer", "title": "protocolFeesY" },
        ],
      }],
    },
  },
  {
    redeemer: {
      "title": "PoolRedeemer",
      "anyOf": [{
        "title": "PoolRedeemer",
        "dataType": "constructor",
        "index": 0,
        "fields": [{ "dataType": "integer", "title": "poolInIx" }, {
          "dataType": "integer",
          "title": "poolOutIx",
        }, {
          "title": "action",
          "description": "Pool action types.",
          "anyOf": [{
            "title": "AMMAction",
            "dataType": "constructor",
            "index": 0,
            "fields": [{
              "dataType": "list",
              "items": { "dataType": "integer" },
              "title": "contextValuesList",
            }],
          }, {
            "title": "PDAOAction",
            "dataType": "constructor",
            "index": 1,
            "fields": [],
          }],
        }],
      }],
    },
  },
) as unknown as IPoolT2tValidateStablePoolTransitionT2t;

export interface IPoolT2tExactValidateStablePoolTransitionT2tExact {
  new (daoVotingWitness: string): Validator;
  inputDatum: {
    poolNft: { policy: string; name: string };
    an2n: bigint;
    assetX: { policy: string; name: string };
    assetY: { policy: string; name: string };
    multiplierX: bigint;
    multiplierY: bigint;
    lpToken: { policy: string; name: string };
    amplCoeffIsEditable: boolean;
    lpFeeIsEditable: boolean;
    lpFeeNum: bigint;
    protocolFeeNum: bigint;
    daoStabeProxyWitness: string;
    treasuryAddress: string;
    protocolFeesX: bigint;
    protocolFeesY: bigint;
  };
  redeemer: {
    poolInIx: bigint;
    poolOutIx: bigint;
    action: { AMMAction: { contextValuesList: Array<bigint> } } | "PDAOAction";
  };
}

export const PoolT2tExactValidateStablePoolTransitionT2tExact = Object.assign(
  function (daoVotingWitness: string) {
    return {
      type: "PlutusV2",
      script: applyParamsToScript(
        "590bdf01000032323232323232323223222232323232533300c32323232323232323253330153370e9001180a00309919191919191919191919299981019b8748000c07c0044c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c94ccc118cdc3a4000608a002264646464646464646464a6660a066e1d2004304f00313232323232323232323232323232323232323232323232323232323232323232323232325333074533307453330745333074533307400b100a14a020082940400c52808010a50100114a064a6660e866e1d200000113232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323253330c601002100114a0a66618a0266618a0266e1c01120004a09444c8c8c8c8c94ccc32804008400452829998648099b87007480004cdc38032400029414ccc32004cdc380099b833370400601601e266e1c004cdc199b8200300a00e14a066e04004008cdc0a41fdfffffffffffffffe0200c66e0520feffffffffffffffff01006132323232323232323232323232323232323232323232323232323253330e0013370e9000186f808008991919299987180a9998718080388030a50100114a06464646464646464646464646464a6661e002a6661e00266e2520003370266e00034cdc1004807804099b893370266e00034cdc10028078022400029404cdc4a400066e04cdc000699b8200200f00114a066e08cdc103a80119b800063370404e66e0404520043370401800266e0400ccdc12400800e66e08cdc103900119b800033370404801c66e08024004cdc100200619b8202301b3370466e081b800ccdc019b8202201e3370404003866e08014008cdc100100c19b823370400203603266e08078070cc1b0008cdc024008900119b8106848020dd6987300800986f008008b2999871008350a6103d87a800013374a9000198718098720083525eb80cdc099b8100e3370666e08028158cdc082b241813418900119b8700b0053371266e08cdc0a40000040a466e08018004cdc099b8148302683014c144dd6986f80800986f808011bad30dd0100130dd01002375a61b60200261b6020046eb4c36404004c36404008dd6986b80800986b808011bad30d50100130d501002375a61a60200261a6020046eb4c34404004c34404008dd69867808009867808011bad30cd0100130cd01002375a619602002a66618a0266e2120000071330c901375008666192026ea0114cc32404dd400599864809ba800c330c901375001266192026ea0028cc32404dd400399864809ba8008330c901375000666192026ea0034cc32404dd400725eb804cc32404dd402299864809ba8043330c901375001866192026ea002ccc32404dd400519864809ba8009330c901375001066192026ea001ccc32404dd400119864809ba800e330c901375001a97ae053330c40153330c40153330c4013370e094058266e1c0f008c528099b8703a02114a0266e3c0dc07852819b810190323370203406666e04004008ccc1441d40b40acccc140258040b00a8cdc080100219b810020043370200c02466e0401804ccdc080301499b8100602a3370200400866e04008010ccc11c1ac018010ccc1181a802401cccc11422c04010008ccc1102280401c014dd7185b80800985b808011bae30b50100130ad01031375c6166020026166020046eb8c2c404004c2a4040bcdd69857808009857808011bad30ad0100130ad01002375c6156020026156020026154020046eb4c2a004004c2a004008dd6985300800985300800985280800985200800985180800985100800985080800985000800984f808011bad309d01001309d01001309401045375c6134020026134020046eb8c26004004c24004038dd6984b00800984b008011bad309401001309401002375c6124020026124020026122020046eb4c23c04004c23c04008dd69846808009846808009846008009845808011844808009844808011bad308701001308701002375a610a02002610a020046106020026106020046102020026102020046eb4c1fc004c1fc004c1d81ccc0040048894ccc1e4cdc4000a4000290000a99983c99b870014800052002153330793370e66e180052004480004ccc00c00ccdc100100119b83001480104cdc100119980180199b820020023370666e04005200248010dd6183d000983902c099191919299983c00108008a50330023756600660ea0d40e6660026eacc008c1d01a40d888c8c8cc004004010894ccc1f40045280991919299983e99baf00600114a226600a00a00460fa00461020200460fe00266e9520003307b3374a90011983d9ba90014bd7025eb808c1e8c1ecc1ecc1ecc1ecc1ecc1ec004c1c815ccdd79ba702e374e03ea6660e2a6660e2a6660e2a6660e2a6660e2a6660e2a6660e2a6660e266ebc1100704cdd782080c8a5013375e07e02e29404cdc381e80a8a5013370e07602629404cdd781c8088a5015333071035100d133307100d4a09445280a99983881b88078999838807a504a229404cdc78188048a503370e66600204a0080049001111191919299983a99b8748008004520001375a60f460e600460e600264a6660e866e1d200200114c103d87a8000132323300100100222533307a00114c103d87a8000132323232533307b3371e014004266e9520003307f375000297ae0133006006003375a60f80066eb8c1e8008c1f8008c1f0004dd5983c98390011839000991980080080211299983b8008a6103d87a800013232323253330783371e010004266e9520003307c374c00297ae0133006006003375660f20066eb8c1dc008c1ec008c1e4004dd7183980098398011bae3071001306903e3375e07e03666ebc14c118dd7183680098368009836000983580119b8748008c194dd51834800983480119b8748008c18cdd518338009833801183280098328011bad30630013063002375a60c200260c200460be00260be00460ba00260ba00260b800460b400260a40066020010609200260ac002609c0062c60a8002609800a60a400260a40046eacc140004c140008c138004c118004c130004c11000458cc09c0c40acc00406c8c008004c004004894ccc11800452f5c026608e608860900026600400460920026eb8c114004c114004c110004c10c008cdc3a4004607a6ea8c104004c104008cdc3a400460766ea8c0fc004c0fc008c0f4004c0f4008dd6981d800981d8011bad30390013039002303700130370023035001303500130340023032001302a027303000130280033756605c002605c004605800260480026054002605400460500026040002604c002603c0022c6600201c00e6002002444a6660460042980103d87a80001323253330223370e0069000099ba548000cc0980092f5c0266600a00a00266e0400d20023027003302500230210013021002375a603e002603e0046eb4c074004c054044c06c004c04c01858dd6180c800980c800980c0011bac3016001300e003301400130140023012001300a00514984d958c94ccc030cdc3a40000022646464646464a66602a60300042649319299980999b87480000044c8c94ccc060c06c0084c926323300100100222533301a00114984c8cc00c00cc078008dd6980e0008b1bac30190013011002153330133370e90010008a99980b18088010a4c2c2c60220022c602c002602c0046eb4c050004c050008dd6980900098050030b18050029800802919299980599b87480000044c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c94ccc0b0c0bc0084c8c8c8c92630240143023019302201a302101d16375a605a002605a0046eb4c0ac004c0ac008dd7181480098148011bae30270013027002375a604a002604a0046eb4c08c004c08c008cdc3a4004603a6ea8c084004c084008cdc3a400460366ea8c07c004c07c008c074004c074008dd6980d800980d8011bad301900130190023017001301700230150013015002375a60260026026004602200260120042c6012002464a66601466e1d200000113232323253330113014002149858dd7180900098090011bae30100013008002163008001375c0024600a6ea80048c00cdd5000ab9a5573aaae7955cfaba05742ae89",
        [daoVotingWitness],
        { "dataType": "list", "items": [{ "dataType": "bytes" }] },
      ),
    };
  },
  {
    inputDatum: {
      "title": "PoolDataT2T",
      "description": "Pool data T2T.",
      "anyOf": [{
        "title": "PoolDataT2T",
        "dataType": "constructor",
        "index": 0,
        "fields": [
          {
            "title": "poolNft",
            "anyOf": [{
              "title": "Asset",
              "dataType": "constructor",
              "index": 0,
              "fields": [{ "dataType": "bytes", "title": "policy" }, {
                "dataType": "bytes",
                "title": "name",
              }],
            }],
          },
          { "dataType": "integer", "title": "an2n" },
          {
            "title": "assetX",
            "anyOf": [{
              "title": "Asset",
              "dataType": "constructor",
              "index": 0,
              "fields": [{ "dataType": "bytes", "title": "policy" }, {
                "dataType": "bytes",
                "title": "name",
              }],
            }],
          },
          {
            "title": "assetY",
            "anyOf": [{
              "title": "Asset",
              "dataType": "constructor",
              "index": 0,
              "fields": [{ "dataType": "bytes", "title": "policy" }, {
                "dataType": "bytes",
                "title": "name",
              }],
            }],
          },
          { "dataType": "integer", "title": "multiplierX" },
          { "dataType": "integer", "title": "multiplierY" },
          {
            "title": "lpToken",
            "anyOf": [{
              "title": "Asset",
              "dataType": "constructor",
              "index": 0,
              "fields": [{ "dataType": "bytes", "title": "policy" }, {
                "dataType": "bytes",
                "title": "name",
              }],
            }],
          },
          {
            "title": "amplCoeffIsEditable",
            "anyOf": [{
              "title": "False",
              "dataType": "constructor",
              "index": 0,
              "fields": [],
            }, {
              "title": "True",
              "dataType": "constructor",
              "index": 1,
              "fields": [],
            }],
          },
          {
            "title": "lpFeeIsEditable",
            "anyOf": [{
              "title": "False",
              "dataType": "constructor",
              "index": 0,
              "fields": [],
            }, {
              "title": "True",
              "dataType": "constructor",
              "index": 1,
              "fields": [],
            }],
          },
          { "dataType": "integer", "title": "lpFeeNum" },
          { "dataType": "integer", "title": "protocolFeeNum" },
          { "dataType": "bytes", "title": "daoStabeProxyWitness" },
          { "dataType": "bytes", "title": "treasuryAddress" },
          { "dataType": "integer", "title": "protocolFeesX" },
          { "dataType": "integer", "title": "protocolFeesY" },
        ],
      }],
    },
  },
  {
    redeemer: {
      "title": "PoolRedeemer",
      "anyOf": [{
        "title": "PoolRedeemer",
        "dataType": "constructor",
        "index": 0,
        "fields": [{ "dataType": "integer", "title": "poolInIx" }, {
          "dataType": "integer",
          "title": "poolOutIx",
        }, {
          "title": "action",
          "description": "Pool action types.",
          "anyOf": [{
            "title": "AMMAction",
            "dataType": "constructor",
            "index": 0,
            "fields": [{
              "dataType": "list",
              "items": { "dataType": "integer" },
              "title": "contextValuesList",
            }],
          }, {
            "title": "PDAOAction",
            "dataType": "constructor",
            "index": 1,
            "fields": [],
          }],
        }],
      }],
    },
  },
) as unknown as IPoolT2tExactValidateStablePoolTransitionT2tExact;

export interface IProxyDaoT2tStablePoolT2tProxyDao {
  new (): Validator;
  datum: { poolNft: { policy: string; name: string } };
  action: {
    poolInIx: bigint;
    poolOutIx: bigint;
    daoInIx: bigint;
    daoOutIx: bigint;
    daoActionIx: bigint;
  };
}

export const ProxyDaoT2tStablePoolT2tProxyDao = Object.assign(
  function () {
    return {
      type: "PlutusV2",
      script:
        "59098201000032323232323232323222232323232533300a32323232533300e3370e9001180680089919191919191919191919191919191919191919299981119b8748000c0840044c8c8c8c8c8c8c8c8c94ccc0accdc3a400860540022646464a66605c66e1d2000302d0011323232323253330333370e90001819000899191919191919299981d19b8748000c0e40044c8c8c8c8c8c8c8c94ccc108cdc3a400860820022646464a66608a66e1d2000304400113232323253330493370e9000182400089919191919191919299982899b8748010c1400044c8c8c8c8c8c8c8c94ccc1654ccc1654ccc1654ccc164014401052808018a50100214a020022940c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c94ccc23804008400452829998468099b8706f480004c8c94ccc23c054ccc23c040a8400852808008a50533308e01533308e01533308e01533308e01533308e01533308e013370e04000c266e1c078010528099baf374c0cc6e9813c528099baf05f04814a0266e1c0cc058528099b8702500b14a0266e3c08802052829998468099b89480080304cdc4806241817004294054ccc23404cdc3837a400426464a66611e02004200229414ccc238054ccc238054ccc238054ccc238054ccc238054ccc23804cdc3810003099b8701e00414a0266ebcdd30331ba604f14a0266ebc17c120528099b8703301614a0266e1c03409c528099b8f00802214a0a66611a0266e25200200a133712014905f4d060a501533308d013370e0de90020a99984680a99984680a99984680a99984680a99984680a9998468099b8701f00513370e03a00629404cdd79ba6065374c09c29404cdd782f0238a5013370e06402a29404cdc38060130a5013370e014048294054ccc23404cdc3837a400c2646464646464646464646464646464646464646464646464a66614a02a66614a02a66614a02002200429404cdc4a400003a29404cdc4a400003629414ccc290054ccc290054ccc290054ccc29004cdd783a82f099b8704902c14a0266e1c08c0f4528099b8702103b14a0266e3c0780e052829998518099b8700400213370e0060022940cdc080c01919b810190333370200400866e04008010ccc11817c018010ccc11417802401cccc1101d0010008ccc10c1cc01c014dd7184f80800984f808011bae309d01001309501005375c6136020026136020046eb8c26404004c2440400cc25c04004c25c04008c25404004c25404004c25004004c22c0418454ccc23404cdc3837a40102646464a66612002a6661200205a200429404004528299984780a99984780a99984780a99984780a99984780a9998478099b8702100713370e03e00a29404cdd79ba6067374c0a029404cdd78300248a5013370e01c05029404cdc38060130a5013371e01204629414ccc23804cdc4a4004002266e2400520a09c0114a066e0c05520201533308d013370e0de90050a99984680a99984680a99984680a99984680a99984680a9998468099b8701f00513370e03a00629404cdd79ba6065374c09c29404cdc381900a8a5013370e01804c29404cdc38050120a5013371e00e042294052819b8701700133303304c019017375a611e02002611e020046eb4c23404004c23404008dd71845808009845808009845008011bad308801001308801002375a610c02002610c02002610a0200261080200261060200261040200261020200261000200260fe0046eb4c1f4004c1f4004c1d00ccccc07413400c004dd7183c800983c8011bae3077001306f010375a60ea00260ea0046eb4c1cc004c1cc008dd71838800983880098380011bad306e001306e002375a60d800260d800466e1d20023066375460d400260d400466e1d20023064375460d000260d000460cc00260cc00260ca00260c800260c600260c40046eb4c180004c180004c15c0b4888c8c8c94ccc178cdc3a40040022900009bad3063305c002305c00132533305d3370e90010008a6103d87a8000132323300100100222533306300114c103d87a800013232323253330643371e014004266e95200033068375000297ae0133006006003375a60ca0066eb8c18c008c19c008c194004dd59831182d801182d80099198008008021129998300008a6103d87a800013232323253330613371e010004266e95200033065374c00297ae0133006006003375660c40066eb8c180008c190008c188004cdd79ba601f374c01266ebc14c010cdd780f80499baf04530593052020304c0013057001304f0011630550013055002375660a600260a600460a20026092002609e002608e0022c66050068058602e008609600260860022c6040608400e609000260800022c608c002608c0046eacc110004c110008c108004c0e8004c100004c0e000458cc064094084dd5981e800981e801181d800981998089819800981c80098188008b1980901080c1800802919299981919b87480000044c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c94ccc14cc1580084c8c8c8c926304d014304c019304b01a304a01d16375a60a800260a80046eb4c148004c148008dd7182800098280011bae304e001304e002375a609800260980046eb4c128004c128008cdc3a400460886ea8c120004c120008cdc3a400460846ea8c118004c118008c110004c110008dd6982100098210011bad30400013040002303e001303e002303c001303c002375a60740026074004607000260600042c6060002606800260580022c6012605600e606200260520022c605e002605e0046eacc0b4004c0b4008c0ac004c08cc004c08c0088c0a8c0ac004c0a0004c08000458cc00404002cc0040048894ccc094008530103d87a80001323253330243370e0069000099ba548000cc0a00092f5c0266600a00a00266e0400d200230290033027002375a604600260460046eb4c084004c084008dd6980f800980f8011bad301d001301d002375a603600260260226eb0c064004c064004c060008dd6180b0009807002980a00098060008b18090009809001180800098040028a4c26cac64a66601466e1d20000011323232323232323232325333017301a002149858dd6980c000980c0011bad30160013016002375a602800260280046eb4c048004c048008dd6980800098040030b18040029800802919299980499b87480000044c8c94ccc038c0440084c926300500116300f001300700216300700123253330083370e9000000899191919299980798090010a4c2c6eb8c040004c040008dd7180700098030010b1803000918029baa001230033754002ae6955ceaab9e5573eae815d0aba201",
    };
  },
  {
    datum: {
      "title": "DAOData",
      "description": "DAO contract config (congig is immutable).",
      "anyOf": [{
        "title": "DAOData",
        "dataType": "constructor",
        "index": 0,
        "fields": [{
          "title": "poolNft",
          "anyOf": [{
            "title": "Asset",
            "dataType": "constructor",
            "index": 0,
            "fields": [{ "dataType": "bytes", "title": "policy" }, {
              "dataType": "bytes",
              "title": "name",
            }],
          }],
        }],
      }],
    },
  },
  {
    action: {
      "title": "DAOAction",
      "description": "DAO action types:",
      "anyOf": [{
        "title": "DAOAction",
        "dataType": "constructor",
        "index": 0,
        "fields": [
          { "dataType": "integer", "title": "poolInIx" },
          { "dataType": "integer", "title": "poolOutIx" },
          { "dataType": "integer", "title": "daoInIx" },
          { "dataType": "integer", "title": "daoOutIx" },
          { "dataType": "integer", "title": "daoActionIx" },
        ],
      }],
    },
  },
) as unknown as IProxyDaoT2tStablePoolT2tProxyDao;

export interface IDepositT2t2tStableDepositT2t2t {
  new (): Validator;
  datum: {
    poolNft: { policy: string; name: string };
    redeemer: string;
    minExpectedLpAmount: bigint;
  };
  action: {
    ApplyOrder: {
      redeemerInIx: bigint;
      redeemerOutIx: bigint;
      poolInIx: bigint;
    };
  } | "CancelOrder";
}

export const DepositT2t2tStableDepositT2t2t = Object.assign(
  function () {
    return {
      type: "PlutusV2",
      script:
        "59052101000032323232323232323222232323253330093232323232323232323232323232323253330193370e900000089919191919191919191919191919299981399b8748000c0980044c8c8c8c8c8c8c8c8c8c8c8c94ccc0cccdc3a4000606400226464646464646464a66607666e1d2004303a0011323232323232323232323232323232323232533304d3370e9000182600089919191919191919191919299982c299982c00188010a50100114a0646464a6660b466e1d200000113371e0866eb8c17cc1600084cdd79801982c1812982c019005182c0009800982b1800982b0051182e80099b890290023370e66600403a04c0489001199800801005804911191919299982c99b8748008004520001375a60bc60ae00460ae00264a6660b066e1d200200114c103d87a8000132323300100100222533305e00114c103d87a8000132323232533305f3371e014004266e95200033063375000297ae0133006006003375a60c00066eb8c178008c188008c180004dd5982e982b001182b000991980080080211299982d8008a6103d87a8000132323232533305c3371e010004266e95200033060374c00297ae0133006006003375660ba0066eb8c16c008c17c008c174004dd5982b800982b801182a8009826800982980098258008b198138148181bae30500013050002375c609c002608c002609800260980026096002609400260920026090002608e002608c002608a002607800464a66607c66e1d200000113232323232323232323232323232323232323232323232323232323232323232323232325333065306800213232323232498c18005cc17c078c17807cc174080c17008c58dd6983300098330011bad30640013064002375a60c400260c40046eb8c180004c180008dd7182f000982f0011bad305c001305c002375a60b400260b400466e1d20023054375460b000260b000466e1d20023052375460ac00260ac00460a800260a80046eb4c148004c148008dd6982800098280011bad304e001304e002304c001304c002304a001304a00230480013048002375a608c002608c004608800260780042c6078002608200260720022c607e002607e0046eacc0f4004c0f4004c0d0c004c0d00088c0ecc0f0004c0e4004c0c400458cc034048050dd7181b000981b0011bae3034001302c004375a606400260640026062004605e002604e04c605a002604a0022c6600200c0186002002444a666054004298103d87a80001323253330293370e0069000099ba548000cc0b40092f5c0266600a00a00266e0400d2002302e003302c002375860500026050002604e0046eb0c094004c074054dd6981180098118011bad30210013021002375a603e002602e02a2646600200200c44a66603c00229404c8c94ccc074cdc78010030a511330040040013022002375c6040002602e0286eb8c070004c070004c04c048dd6180c800980c800980c000980b800980b000980a800980a000980980098090009804800980780098038020a4c26cac64a66601266e1d2000001132323232323253330123015002149858dd6980980098098011bad30110013011002375a601e002600e00a2a66601266e1d20020011533300c300700514985858c01c010c94ccc020cdc3a40000022646464646464a66602260280042649318040028b1bad30120013012002375c60200026020004601c002600c00a2c600c008464a66601066e1d2000001132323232533300f3012002149858dd7180800098080011bae300e0013006002163006001230053754002460066ea80055cd2ab9d5573caae7d5d02ba157441",
    };
  },
  {
    datum: {
      "title": "DepositData",
      "description": "AMM-orders data.",
      "anyOf": [{
        "title": "DepositData",
        "dataType": "constructor",
        "index": 0,
        "fields": [
          {
            "title": "poolNft",
            "anyOf": [{
              "title": "Asset",
              "dataType": "constructor",
              "index": 0,
              "fields": [{ "dataType": "bytes", "title": "policy" }, {
                "dataType": "bytes",
                "title": "name",
              }],
            }],
          },
          { "dataType": "bytes", "title": "redeemer" },
          { "dataType": "integer", "title": "minExpectedLpAmount" },
        ],
      }],
    },
  },
  {
    action: {
      "title": "OrderAction",
      "description": "Order action types.",
      "anyOf": [{
        "title": "ApplyOrder",
        "dataType": "constructor",
        "index": 0,
        "fields": [{ "dataType": "integer", "title": "redeemerInIx" }, {
          "dataType": "integer",
          "title": "redeemerOutIx",
        }, { "dataType": "integer", "title": "poolInIx" }],
      }, {
        "title": "CancelOrder",
        "dataType": "constructor",
        "index": 1,
        "fields": [],
      }],
    },
  },
) as unknown as IDepositT2t2tStableDepositT2t2t;

export interface IPoolT2t2tValidateStablePoolTransitionT2t2t {
  new (daoVotingWitness: string): Validator;
  inputDatum: {
    poolNft: { policy: string; name: string };
    an2n: bigint;
    assetX: { policy: string; name: string };
    assetY: { policy: string; name: string };
    assetZ: { policy: string; name: string };
    multiplierX: bigint;
    multiplierY: bigint;
    multiplierZ: bigint;
    lpToken: { policy: string; name: string };
    amplCoeffIsEditable: boolean;
    lpFeeIsEditable: boolean;
    lpFeeNum: bigint;
    protocolFeeNum: bigint;
    daoStabeProxyWitness: string;
    treasuryAddress: string;
    protocolFeesX: bigint;
    protocolFeesY: bigint;
    protocolFeesZ: bigint;
  };
  redeemer: {
    poolInIx: bigint;
    poolOutIx: bigint;
    action: { AMMAction: { contextValuesList: Array<bigint> } } | "PDAOAction";
  };
}

export const PoolT2t2tValidateStablePoolTransitionT2t2t = Object.assign(
  function (daoVotingWitness: string) {
    return {
      type: "PlutusV2",
      script: applyParamsToScript(
        "590fb801000032323232323232323223222232323232533300c32323232323232323253330153370e9001180a00309919191919191919191919299981019b8748000c07c0044c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c94ccc128cdc3a40006092002264646464646464646464a6660a866e1d20043053003132323232323232323232323232323232323232323232323232323232323232323232323232323232533307c533307c533307c533307c533307c00b100a14a020082940400c52808010a50100114a064a6660f866e1d200000113232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323253330e301002100114a0a6661c4026661c40266e1c01520004a09444c8c8c8c8c94ccc39c040084004528299987300a9998730099b89480000204cdc4a400000e29404cdc4a400000c29414ccc394054ccc39404cdc499b820010133370400601a266e24cdc100080919b8200300c14a0266e24cdc100080899b8200300b14a066e04004008cdc0a41fdfffffffffffffffe0200e66e0520feffffffffffffffff01007132323232323232323232323232323232323232323232323232323232323232323232325333085023370e9000184201000899191929998440129998440100388030a50100114a0646464646464646464a6661200466e2520003370266e00020cdc1002805002099b893370266e00020cdc1001005000a40002940cdc119b8208d010023370066e00cdc101601019b8202a00c3370405003866e0801c004cdc119b823370400803c01403466e08cdc10450080119b803370066e080a408ccdc101381099b8202501f3370400800266e08cdc119b8200102101f01d3370466e08098090088cc22404008cdc02400c900119b8108501480d8dd69845810009841810008b299984381043808a60103d87a800013374a9000198440118448104380a5eb80cdc099b810123370666e080301bccdc0837a41813418900129998410119b8700d00513370e00e90000a503371266e08cdc0a40000040d666e08020004cdc099b814830268301b01a8dd69842010009842010011bad308202001308202002375a6100040026100040046eb4c3f804004c3f804008dd6987e00800987e008011bad30fa0100130fa01002375a61f00200261f0020046eb4c3d804004c3d804008dd6987a00800987a008011bad30f20100130f201002375a61e00200261e0020046eb4c3b804004c3b804008dd69876008009876008011bad30ea0100130ea01002375a61d002002a6661c402a6661c402a6661c40266e21200001213371002690000a5013370e02290000a501330e60137500ac661cc026ea0160cc39804dd402a19873009ba800f330e6013750020661cc026ea0038cc39804dd400619873009ba800d330e6013750016661cc026ea0024cc39804dd400519873009ba8004330e6013750004661cc026ea0048cc39804dd4009a5eb8054ccc388054ccc388054ccc38804cdc424000026266e20049200014a0266e1c045200014a02661cc026ea0160cc39804dd402b19873009ba8054330e6013750020661cc026ea003ccc39804dd400719873009ba800d330e6013750018661cc026ea002ccc39804dd400519873009ba8009330e6013750006661cc026ea0008cc39804dd400999873009ba80124bd700a99987100a99987100a9998710099b88480000444cdc4009a400029404cdc38092400029404cc39804dd402a19873009ba8058330e60137500ac661cc026ea0038cc39804dd400819873009ba800f330e6013750016661cc026ea0034cc39804dd400619873009ba8008330e6013750014661cc026ea0010cc39804dd400199873009ba8011330e601375002697ae0153330e20153330e20153330e201337109000009899b8801148000528099b8701248000528099873009ba8058330e60137500a8661cc026ea0158cc39804dd400819873009ba800e330e601375001e661cc026ea0034cc39804dd400599873009ba800c330e6013750014661cc026ea0020cc39804dd400119873009ba8003330e6013750026661cc026ea00452f5c02a6661c402a6661c402a6661c40266e21200001213371002290000a5013370e02690000a501330e60137500ac661cc026ea0150cc39804dd402c19873009ba800f330e601375001c661cc026ea0040cc39804dd400619873009ba800b330e601375001a661cc026ea0024cc39804dd400419873009ba8002330e6013750008661cc026ea0048cc39804dd4008a5eb804cc39804dd402a19873009ba8056330e60137500b0661cc026ea0038cc39804dd400799873009ba8010330e6013750016661cc026ea0030cc39804dd400699873009ba8008330e6013750012661cc026ea000ccc39804dd400219873009ba8011330e601375002497ae053330e10153330e10153330e1013370e0be076266e1c1340c0528099b8704b02e14a0266e3c1200ac52819b810240413370204a08466e0409810ccdc08008011998328468081d81c9998320590081d01c19b810030063370200600c66e0400c018cdc080480d99b8100901c3370201203a66e040240d4cdc080481b19b810090373370200600c66e0400c018cdc080180319982b83f80400319982b03f00580499982a83e80700619982a0510080280199982985080804003199829050008058049bae30cd0100130cd01002375c61960200261860207a6eb8c32404004c32404008dd7186380800985f8081d9bae30c50100130c501002375c6186020026176020726eb4c30404004c30404008dd6985f80800985f808011bad30bd0100130bd01002375c6176020026176020026174020046eb4c2e004004c2e004008dd6985b00800985b00800985a80800985a008009859808009859008009858808009858008009857808009857008009856808011bad30ab0100130ab0100130a20104f375c6150020026150020046eb8c29804004c27804040dd69852008009852008011bad30a20100130a201002375a6140020026140020046eb8c27804004c27804004c27404008dd6984d80800984d808011bad309901001309901001309801001309701002309501001309501002375a6126020026126020046eb4c24404004c24404008dd69847808009847808011846808009846808011845808009845808011844808009844808011bad308701001308701001307e07b30010012225333081013371000290000a40002a6661020266e1c005200014800854ccc20404cdc399b8600148011200013330030033370400400466e0c005200413370400466600600666e08008008cdc199b81001480092004375861040200260f40c0264646464a6661000200420022940cc008dd59801983e83903d998009bab3002307c07103a223232330010010042253330850100114a02646464a66610a0266ebc01800452889980280280118428080118448080118438080099ba548000cc20c04cdd2a400466106026ea40052f5c097ae02308201308301308301308301308301308301308301001307a05f3375e6e9c0c8dd3811a99983ca99983ca99983ca99983ca99983ca99983ca99983ca99983ca99983ca99983c99baf04c02013375e09203a29404cdd782380d8a5013375e08a03229404cdc382180b8a5013370e08202a29404cdc381f8098a5013375e07a022294054ccc1e40e440344ccc1e40352825114a02a6660f2076201e26660f201e941288a5013371e06a0122940cdc399980081480200124004444646464a6660fa66e1d20020011480004dd6984100983d801183d80099299983e19b8748008004530103d87a800013232330010010022253330820100114c103d87a80001323232325333083013371e014004266e9520003308701375000297ae0133006006003375a6108020066eb8c20804008c21804008c21004004dd5984080983d001183d000991980080080211299983f8008a6103d87a80001323232325333080013371e010004266e9520003308401374c00297ae013300600600337566102020066eb8c1fc008c20c04008c20404004dd7183d800983d8011bae307900130710463375e08e03e66ebc16c138dd7183a800983a800983a000983980119b8748008c1b4dd51838800983880119b8748008c1acdd518378009837801183680098368011bad306b001306b002375a60d200260d20046eb4c19c004c19c008c194004c194008c18c004c18c008c184004c184004c180008c178004c15800cc040020c134004c168004c14800c58c160004c140014c158004c158008dd5982a000982a00118290009825000982800098240008b1981581a817980080f9180100098008009129998250008a5eb804cc12cc120c130004cc008008c134004dd7182480098248009824000982380119b8748008c104dd51822800982280119b8748008c0fcdd518218009821801182080098208011bad303f001303f002375a607a002607a0046eb4c0ec004c0ec008c0e4004c0e4008c0dc004c0dc008c0d4004c0d4004c0d0008c0c8004c0a809cc0c0004c0a000cdd5981700098170011816000981200098150009815001181400098100009813000980f0008b19800807003980080091129998118010a6103d87a80001323253330223370e0069000099ba548000cc0980092f5c0266600a00a00266e0400d20023027003302500230210013021002375a603e002603e0046eb4c074004c054044c06c004c04c01858dd6180c800980c800980c0011bac3016001300e003301400130140023012001300a00514984d958c94ccc030cdc3a40000022646464646464a66602a60300042649319299980999b87480000044c8c94ccc060c06c0084c926323300100100222533301a00114984c8cc00c00cc078008dd6980e0008b1bac30190013011002153330133370e90010008a99980b18088010a4c2c2c60220022c602c002602c0046eb4c050004c050008dd6980900098050030b18050029800802919299980599b87480000044c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c94ccc0c8c0d40084c8c8c8c8c926302b017302a01e302901f3028020302702316375a606600260660046eb4c0c4004c0c4008dd6981780098178011bae302d001302d002375c605600260560046eb4c0a4004c0a4008dd69813800981380119b8748008c084dd51812800981280119b8748008c07cdd518118009811801181080098108011bad301f001301f002375a603a002603a0046eb4c06c004c06c008c064004c064008c05c004c05c008c054004c054008dd698098009809801180880098048010b1804800919299980519b87480000044c8c8c8c94ccc044c05000852616375c602400260240046eb8c040004c02000858c020004dd7000918029baa001230033754002ae6955ceaab9e5573eae815d0aba201",
        [daoVotingWitness],
        { "dataType": "list", "items": [{ "dataType": "bytes" }] },
      ),
    };
  },
  {
    inputDatum: {
      "title": "PoolDataT2T2T",
      "description": "Pool data T2T2T.",
      "anyOf": [{
        "title": "PoolDataT2T2T",
        "dataType": "constructor",
        "index": 0,
        "fields": [
          {
            "title": "poolNft",
            "anyOf": [{
              "title": "Asset",
              "dataType": "constructor",
              "index": 0,
              "fields": [{ "dataType": "bytes", "title": "policy" }, {
                "dataType": "bytes",
                "title": "name",
              }],
            }],
          },
          { "dataType": "integer", "title": "an2n" },
          {
            "title": "assetX",
            "anyOf": [{
              "title": "Asset",
              "dataType": "constructor",
              "index": 0,
              "fields": [{ "dataType": "bytes", "title": "policy" }, {
                "dataType": "bytes",
                "title": "name",
              }],
            }],
          },
          {
            "title": "assetY",
            "anyOf": [{
              "title": "Asset",
              "dataType": "constructor",
              "index": 0,
              "fields": [{ "dataType": "bytes", "title": "policy" }, {
                "dataType": "bytes",
                "title": "name",
              }],
            }],
          },
          {
            "title": "assetZ",
            "anyOf": [{
              "title": "Asset",
              "dataType": "constructor",
              "index": 0,
              "fields": [{ "dataType": "bytes", "title": "policy" }, {
                "dataType": "bytes",
                "title": "name",
              }],
            }],
          },
          { "dataType": "integer", "title": "multiplierX" },
          { "dataType": "integer", "title": "multiplierY" },
          { "dataType": "integer", "title": "multiplierZ" },
          {
            "title": "lpToken",
            "anyOf": [{
              "title": "Asset",
              "dataType": "constructor",
              "index": 0,
              "fields": [{ "dataType": "bytes", "title": "policy" }, {
                "dataType": "bytes",
                "title": "name",
              }],
            }],
          },
          {
            "title": "amplCoeffIsEditable",
            "anyOf": [{
              "title": "False",
              "dataType": "constructor",
              "index": 0,
              "fields": [],
            }, {
              "title": "True",
              "dataType": "constructor",
              "index": 1,
              "fields": [],
            }],
          },
          {
            "title": "lpFeeIsEditable",
            "anyOf": [{
              "title": "False",
              "dataType": "constructor",
              "index": 0,
              "fields": [],
            }, {
              "title": "True",
              "dataType": "constructor",
              "index": 1,
              "fields": [],
            }],
          },
          { "dataType": "integer", "title": "lpFeeNum" },
          { "dataType": "integer", "title": "protocolFeeNum" },
          { "dataType": "bytes", "title": "daoStabeProxyWitness" },
          { "dataType": "bytes", "title": "treasuryAddress" },
          { "dataType": "integer", "title": "protocolFeesX" },
          { "dataType": "integer", "title": "protocolFeesY" },
          { "dataType": "integer", "title": "protocolFeesZ" },
        ],
      }],
    },
  },
  {
    redeemer: {
      "title": "PoolRedeemer",
      "anyOf": [{
        "title": "PoolRedeemer",
        "dataType": "constructor",
        "index": 0,
        "fields": [{ "dataType": "integer", "title": "poolInIx" }, {
          "dataType": "integer",
          "title": "poolOutIx",
        }, {
          "title": "action",
          "description": "Pool action types.",
          "anyOf": [{
            "title": "AMMAction",
            "dataType": "constructor",
            "index": 0,
            "fields": [{
              "dataType": "list",
              "items": { "dataType": "integer" },
              "title": "contextValuesList",
            }],
          }, {
            "title": "PDAOAction",
            "dataType": "constructor",
            "index": 1,
            "fields": [],
          }],
        }],
      }],
    },
  },
) as unknown as IPoolT2t2tValidateStablePoolTransitionT2t2t;

export interface IProxyDaoT2t2tStablePoolT2t2tProxyDao {
  new (): Validator;
  datum: { poolNft: { policy: string; name: string } };
  action: {
    poolInIx: bigint;
    poolOutIx: bigint;
    daoInIx: bigint;
    daoOutIx: bigint;
    daoActionIx: bigint;
  };
}

export const ProxyDaoT2t2tStablePoolT2t2tProxyDao = Object.assign(
  function () {
    return {
      type: "PlutusV2",
      script:
        "590a7201000032323232323232323222232323232533300a32323232533300e3370e9001180680089919191919191919191919191919191919191919299981119b8748000c0840044c8c8c8c8c8c8c8c8c94ccc0accdc3a400860540022646464a66605c66e1d2000302d0011323232323253330333370e90001819000899191919191919299981d19b8748000c0e40044c8c8c8c8c8c8c8c94ccc108cdc3a400860820022646464a66608a66e1d2000304400113232323253330493370e9000182400089919191919191919299982899b8748010c1400044c8c8c8c8c8c8c8c94ccc1654ccc1654ccc1654ccc164014401052808018a50100214a020022940c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c94ccc258040084004528299984a8099b87077480004c8c94ccc25c054ccc25c040c0400852808008a505333096015333096015333096015333096015333096015333096015333096013370e04c010266e1c090018528099b8702200414a0266ebcdd30371ba605714a0266ebc19c140528099b8703b01a14a0266e1c0ac034528099b8f02800a14a0a66612a0266e25200200e13371201c90605c010a5015333095013370e0ee900109919299984b8080108008a505333096015333096015333096015333096015333096015333096015333096013370e04c010266e1c090018528099b8702200414a0266ebcdd30371ba605714a0266ebc19c140528099b8703b01a14a0266e1c03c0b4528099b8f00a02814a0a66612a0266e25200200c133712018905f4d060a5015333095013370e0ee90020a99984a80a99984a80a99984a80a99984a80a99984a80a99984a80a99984a8099b8702500713370e04600a29404cdc38108018a5013375e6e981b4dd302b0a5013375e0cc09e29404cdc381d00c8a5013370e01c05829404cdc38060150a5015333095013370e0ee9003099191919191919191919191919191919191919191919191919191919191919191919299985b80a99985b80a99985b80a99985b8080088010a5013371290000148a5013371290000138a5013371290000128a5053330b60153330b60153330b60153330b6013375e10e020e0266e1c16c0e8528099b8702f04d14a0266e1c0b412c528099b8f02a04814a0a66616a02a66616a0266e1c01800c4cdc38028010a5013370e0080022940cdc081102019b810230413370204808466e0400c018cdc080180319b8100300633305606f00800633305506e00b00933305406d00e00c33305308301005003333052082010080063330510810100b009375c615a02002615a020046eb8c2ac04004c28c04024dd71854808009854808011bae30a701001309f01007375c614a02002614a020046eb8c28c04004c26c04014c28404004c28404008c27c04004c27c04008c27404004c27404004c27004004c24c041a454ccc25404cdc383ba40102646464a66613002a66613002066200429404004528299984b80a99984b80a99984b80a99984b80a99984b80a99984b80a99984b8099b8702700913370e04a00e29404cdc38118028a5013375e6e981bcdd302c0a5013375e0d00a229404cdc38080170a5013370e01c05829404cdc78058148a50533309601337129001000899b8900148282700452819b83019482c82c54ccc25404cdc383ba40142a66612a02a66612a02a66612a02a66612a02a66612a02a66612a02a66612a0266e1c09401c4cdc38118028a5013370e04200629404cdd79ba606d374c0ac29404cdc381d00c8a5013370e01c05829404cdc38060150a5013371e01204e294052819b8701b00133303b05401d01b375a612e02002612e020046eb4c25404004c25404008dd69849808009849808011bae309101001309101001309001002375a611c02002611c020046eb4c23004004c23004004c22c04004c22804004c22404004c22004004c21c04004c21804004c21404004c21004004c20c04008dd6984080800984080800983c01b9998108288018009bae307d001307d002375c60f600260e60246eb4c1e4004c1e4008dd6983b800983b8011bad30750013075002375c60e600260e600260e40046eb4c1c0004c1c0008dd69837000983700119b8748008c1a0dd51836000983600119b8748008c198dd518350009835001183400098340009833800983300098328009832000983180098310011bad30600013060001305702d222323232533305e3370e90010008a400026eb4c18cc170008c170004c94ccc174cdc3a4004002298103d87a8000132323300100100222533306300114c103d87a800013232323253330643371e014004266e95200033068375000297ae0133006006003375a60ca0066eb8c18c008c19c008c194004dd59831182d801182d80099198008008021129998300008a6103d87a800013232323253330613371e010004266e95200033065374c00297ae0133006006003375660c40066eb8c180008c190008c188004cdd79ba601f374c01266ebc14c010cdd780f80499baf04530593052020304c0013057001304f0011630550013055002375660a600260a600460a20026092002609e002608e0022c66050068058602e008609600260860022c6040608400e609000260800022c608c002608c0046eacc110004c110008c108004c0e8004c100004c0e000458cc064094084dd5981e800981e801181d800981998089819800981c80098188008b1980901080c1800802919299981919b87480000044c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c94ccc164c1700084c8c8c8c8c9263054017305301e305201f3051020305002316375a60b400260b40046eb4c160004c160008dd6982b000982b0011bae30540013054002375c60a400260a40046eb4c140004c140008dd69827000982700119b8748008c120dd51826000982600119b8748008c118dd518250009825001182400098240011bad30460013046002375a608800260880046eb4c108004c108008c100004c100008c0f8004c0f8008c0f0004c0f0008dd6981d000981d001181c00098180010b1818000981a00098160008b18049815803981880098148008b181780098178011bab302d001302d002302b0013023300130230022302a302b00130280013020001163300101000b3001001222533302500214c103d87a80001323253330243370e0069000099ba548000cc0a00092f5c0266600a00a00266e0400d200230290033027002375a604600260460046eb4c084004c084008dd6980f800980f8011bad301d001301d002375a603600260260226eb0c064004c064004c060008dd6180b0009807002980a00098060008b18090009809001180800098040028a4c26cac64a66601466e1d20000011323232323232323232325333017301a002149858dd6980c000980c0011bad30160013016002375a602800260280046eb4c048004c048008dd6980800098040030b18040029800802919299980499b87480000044c8c94ccc038c0440084c926300500116300f001300700216300700123253330083370e9000000899191919299980798090010a4c2c6eb8c040004c040008dd7180700098030010b1803000918029baa001230033754002ae6955ceaab9e5573eae815d0aba201",
    };
  },
  {
    datum: {
      "title": "DAOData",
      "description": "DAO contract config (congig is immutable).",
      "anyOf": [{
        "title": "DAOData",
        "dataType": "constructor",
        "index": 0,
        "fields": [{
          "title": "poolNft",
          "anyOf": [{
            "title": "Asset",
            "dataType": "constructor",
            "index": 0,
            "fields": [{ "dataType": "bytes", "title": "policy" }, {
              "dataType": "bytes",
              "title": "name",
            }],
          }],
        }],
      }],
    },
  },
  {
    action: {
      "title": "DAOAction",
      "description": "DAO action types:",
      "anyOf": [{
        "title": "DAOAction",
        "dataType": "constructor",
        "index": 0,
        "fields": [
          { "dataType": "integer", "title": "poolInIx" },
          { "dataType": "integer", "title": "poolOutIx" },
          { "dataType": "integer", "title": "daoInIx" },
          { "dataType": "integer", "title": "daoOutIx" },
          { "dataType": "integer", "title": "daoActionIx" },
        ],
      }],
    },
  },
) as unknown as IProxyDaoT2t2tStablePoolT2t2tProxyDao;

export interface IRedeemT2t2tStableRedeemT2t2t {
  new (): Validator;
  datum: {
    poolNft: { policy: string; name: string };
    redeemer: string;
    minExpectedX: bigint;
    minExpectedY: bigint;
    minExpectedZ: bigint;
  };
  action: {
    ApplyOrder: {
      redeemerInIx: bigint;
      redeemerOutIx: bigint;
      poolInIx: bigint;
    };
  } | "CancelOrder";
}

export const RedeemT2t2tStableRedeemT2t2t = Object.assign(
  function () {
    return {
      type: "PlutusV2",
      script:
        "59059d01000032323232323232323222232323253330093232323232323232323232323232323253330193370e900000089919191919191919191919191919299981399b8748000c0980044c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8c94ccc0dccdc3a4000606c00226464646464646464a66607e66e1d2004303e001132323232323232323232323232323232323232323232323253330573370e9000182b0008991919191919191919191919192999832299983200188010a50100114a0646464a6660cc66e1d200000113371e6eb8c0b4c19018cdd718359832001099baf30033064302d306403e00c3064001300130623001306200c23069001533306253330623371206a008266e240cc00c528099b8903100214a066e1cccc0100940b80b1200233300300400d00b33300200301000e33300100201301122232323253330633370e90010008a400026eb4c1a0c184008c184004c94ccc188cdc3a40040022980103d87a8000132323300100100222533306800114c103d87a800013232323253330693371e014004266e9520003306d375000297ae0133006006003375a60d40066eb8c1a0008c1b0008c1a8004dd598339830001183000099198008008021129998328008a6103d87a800013232323253330663371e010004266e9520003306a374c00297ae0133006006003375660ce0066eb8c194008c1a4008c19c004dd598308009830801182f800982b800982e800982a8008b1981881981d1bae305a001305a002375c60b000260a00126eb8c158004c158008dd7182a00098260039bae30520013052002375c60a0002609000a609c002609c00460980026098004609400260940026092002608000464a66608466e1d200000113232323232323232323232323232323232323232323232323232323232323232323232325333069306c00213232323232498c19005cc18c078c18807cc184080c18008c58dd6983500098350011bad30680013068002375a60cc00260cc0046eb8c190004c190008dd7183100098310011bad30600013060002375a60bc00260bc00466e1d20023058375460b800260b800466e1d20023056375460b400260b400460b000260b00046eb4c158004c158008dd6982a000982a0011bad3052001305200230500013050002304e001304e002304c001304c002375a60940026094004609000260800042c6080002608a002607a0022c608600260860046eacc104004c104004c0e0c004c0e00088c0fcc100004c0f4004c0d400458cc044058060dd7181d000981d0011bae30380013030008375a606c002606c0046eb4c0d0004c0d0008dd698190009819000981880118178009813813181680098128008b19800803006180080091129998150010a6103d87a80001323253330293370e0069000099ba548000cc0b40092f5c0266600a00a00266e0400d2002302e003302c002375860500026050002604e0046eb0c094004c074054dd6981180098118011bad30210013021002375a603e002602e02a2646600200200c44a66603c00229404c8c94ccc074cdc78010030a511330040040013022002375c6040002602e0286eb8c070004c070004c04c048dd6180c800980c800980c000980b800980b000980a800980a000980980098090009804800980780098038020a4c26cac64a66601266e1d2000001132323232323253330123015002149858dd6980980098098011bad30110013011002375a601e002600e00a2a66601266e1d20020011533300c300700514985858c01c010c94ccc020cdc3a4000002264646464646464646464a66602a60300042649318060048b1bad30160013016002375a602800260280046eb4c048004c048008dd718080009808001180700098030028b1803002119299980419b87480000044c8c8c8c94ccc03cc04800852616375c602000260200046eb8c038004c01800858c0180048c014dd5000918019baa0015734aae7555cf2ab9f5740ae855d101",
    };
  },
  {
    datum: {
      "title": "RedeemDataT2T2T",
      "anyOf": [{
        "title": "RedeemDataT2T2T",
        "dataType": "constructor",
        "index": 0,
        "fields": [
          {
            "title": "poolNft",
            "anyOf": [{
              "title": "Asset",
              "dataType": "constructor",
              "index": 0,
              "fields": [{ "dataType": "bytes", "title": "policy" }, {
                "dataType": "bytes",
                "title": "name",
              }],
            }],
          },
          { "dataType": "bytes", "title": "redeemer" },
          { "dataType": "integer", "title": "minExpectedX" },
          { "dataType": "integer", "title": "minExpectedY" },
          { "dataType": "integer", "title": "minExpectedZ" },
        ],
      }],
    },
  },
  {
    action: {
      "title": "OrderAction",
      "description": "Order action types.",
      "anyOf": [{
        "title": "ApplyOrder",
        "dataType": "constructor",
        "index": 0,
        "fields": [{ "dataType": "integer", "title": "redeemerInIx" }, {
          "dataType": "integer",
          "title": "redeemerOutIx",
        }, { "dataType": "integer", "title": "poolInIx" }],
      }, {
        "title": "CancelOrder",
        "dataType": "constructor",
        "index": 1,
        "fields": [],
      }],
    },
  },
) as unknown as IRedeemT2t2tStableRedeemT2t2t;

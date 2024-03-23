const contractAddresses = {
  "bsc-mainnet": {
    Router: "0xc0788a3ad43d79aa53b09c2eacc313a787d1d607",
    Factory: "0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da6",
    wBNB: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
    BANANA: "0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95",
    BUSD: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
    BTCB: "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
    ETH: "0x2170ed0880ac9a755fd29b2688956bd959f933f8",
    CAKE: "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
    BAKE: "0xE02dF9e3e622DeBdD69fb838bB799E3F168902c5",
    USDC: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    BIFI: "0xCa3F508B8e4Dd382eE878A314789373D80A5190A",
    SUSHI: "0x947950bcc74888a40ffa2593c5798f11fc9124c4",
    ADA: "0x3ee2200efb3400fabb9aacf31297cbdd1d435d47",
    BAT: "0x101d82428437127bf1608f699cd651e6abf9766e",
    KEYFI: "0x4b6000f9163de2e3f0a01ec37e06e1469dbbce9d",
    LINK: "0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd",
    DOT: "0x7083609fce4d1d8dc0c979aab8c869ea2c873402",
    XRP: "0x1d2f0da169ceb9fc7b3144628db156f3f6c60dbe",
    SXP: "0x47bead2563dcbf3bf2c9407fea4dc236faba485a",
    USDT: "0x55d398326f99059ff775485246999027b3197955",
    DOGE: "0xba2ae424d960c26247dd6c32edc70b295c744c43",
    LTC: "0x4338665cbb7b2485a8855a139b75d5e34ab0db94",
    DAI: "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
    AUTO: "0xa184088a740c695e156f91f5cc086a06bb78b827",
    WATCH: "0x7a9f28eb62c791422aa23ceae1da9c847cbec9b0",
    SNX: "0x9ac983826058b8a9c7aa1c9171441191232e8404",
    NEAR: "0x1fa4a73a3f0133f0025378af00236f3abdee5d63",
    COTI: "0xadbaf88b39d37dc68775ed1541f1bf83a5a45feb",
    AVAX: "0x1ce0c2827e2ef14d5c4f29a091d735a204794041",
    MATIC: "0xcc42724c6683b7e57334c4e856f4c9965ed682bd",
    AAVE: "0xfb6115445bff7b52feb98650c87f44907e58f802",
    ETC: "0x3d6545b08693dae087e957cb1180ee38b9e3c25e",
    COMP: "0x52ce071bd9b1c4b00a0b92d298c512478cad67e8",
    FTM: "0xad29abb318791d579433d831ed122afeaf29dcfe",
    NRV: "0x42F6f551ae042cBe50C739158b4f0CAC0Edb9096",
    ZEC: "0x1ba42e5193dfa8b03d15dd1b86a3113bbbef8eeb",
    CELR: "0x1f9f6a696c6fd109cd3956f45dc709d2b3902163",
  },
  "bsc-testnet": {
    wBNB: "0xae13d989dac2f0debff460ac112a837c89baa7cd",
    BANANA: "0x4Fb99590cA95fc3255D9fA66a1cA46c43C34b09a",
    BUSD: "0xed24fc36d5ee211ea25a80239fb8c4cfd80f12ee",
    BTCB: "0x6ce8da28e2f864420840cf74474eff5fd80e65b8",
    ETH: "0xd66c6b4f0be8ce5b39d52e0fd1344c389929b378",
  },
};

// Actual on 2021/06/04, ordered by trackedReserveEth DESC
const supportedPairs = [
  {
    id: "0x7a8acaeafc4fa051de4eabff8d1abdd0388ae08a",
    token0: {
      symbol: "KEYFI",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x1ffe0beec4c992974b62c1ea27054f0cbbcf537c",
    token0: {
      symbol: "KEYFI",
    },
    token1: {
      symbol: "BANANA",
    },
  },
  {
    id: "0xf65c1c0478efde3c19b49ecbe7acc57bb6b1d713",
    token0: {
      symbol: "BANANA",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0xc087c78abac4a0e900a327444193dbf9ba69058e",
    token0: {
      symbol: "USDC",
    },
    token1: {
      symbol: "BUSD",
    },
  },
  {
    id: "0x51e6d27fa57373d8d4c256231241053a70cb1d93",
    token0: {
      symbol: "WBNB",
    },
    token1: {
      symbol: "BUSD",
    },
  },
  {
    id: "0x7bd46f6da97312ac2dbd1749f82e202764c0b914",
    token0: {
      symbol: "BANANA",
    },
    token1: {
      symbol: "BUSD",
    },
  },
  {
    id: "0xa0c3ef24414ed9c9b456740128d8e63d016a9e11",
    token0: {
      symbol: "ETH",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x40d4543887e4170a1a40cd8db15a6b297c812cb1",
    token0: {
      symbol: "ADA",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x2e707261d086687470b515b320478eb1c88d49bb",
    token0: {
      symbol: "USDT",
    },
    token1: {
      symbol: "BUSD",
    },
  },
  {
    id: "0x8b6ecea3e9bd6290c2150a89af6c69887aaf1870",
    token0: {
      symbol: "DAI",
    },
    token1: {
      symbol: "BUSD",
    },
  },
  {
    id: "0x1e1afe9d9c5f290d8f6996ddb190bd111908a43d",
    token0: {
      symbol: "BTCB",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0xfd1ef328a17a8e8eeaf7e4ea1ed8a108e1f2d096",
    token0: {
      symbol: "DOGE",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x6f0f18f5fcc1466ec41c8106689e10befe68d1c0",
    token0: {
      symbol: "XRP",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x092ada3818db7fbb8e0a2124ff218c5125c1cce6",
    token0: {
      symbol: "WBNB",
    },
    token1: {
      symbol: "LINK",
    },
  },
  {
    id: "0x29a4a3d77c010ce100a45831bf7e798f0f0b325d",
    token0: {
      symbol: "WBNB",
    },
    token1: {
      symbol: "MATIC",
    },
  },
  {
    id: "0xc0afb6078981629f7eae4f2ae93b6dbea9d7a7e9",
    token0: {
      symbol: "SHIB",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x0f12362c017fe5101c7bba09390f1cb729f5b318",
    token0: {
      symbol: "LTC",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x21cbb561c5d7d70e9e6cc42136cb22f07552aeef",
    token0: {
      symbol: "DOT",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0xdd6c7a955c72b3ffd546d8dadbf7669528d8f785",
    token0: {
      symbol: "ETC",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x47a0b7ba18bb80e4888ca2576c2d34be290772a6",
    token0: {
      symbol: "FTM",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x1d0c3044ebf055986c52d38b19b5369374e6bc6a",
    token0: {
      symbol: "SUSHI",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x61fe209e404166a53cc627d0ae30a65606315da7",
    token0: {
      symbol: "ETH",
    },
    token1: {
      symbol: "ADA",
    },
  },
  {
    id: "0x044f2b275a344d4edfc3d98e1cb7c02b30e6484e",
    token0: {
      symbol: "ETH",
    },
    token1: {
      symbol: "SUSHI",
    },
  },
  {
    id: "0xd0f82498051067e154d1dcd3d88fa95063949d7e",
    token0: {
      symbol: "WBNB",
    },
    token1: {
      symbol: "SPACE",
    },
  },
  {
    id: "0xddd3f9d5bd347c55d18752c0c2075698ec657750",
    token0: {
      symbol: "WBNB",
    },
    token1: {
      symbol: "BIFI",
    },
  },
  {
    id: "0xb7f42e58cf2364ac994f93f7aff3b158cfa3dc76",
    token0: {
      symbol: "CELR",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x60593abea55e9ea9d31c1b6473191cd2475a720d",
    token0: {
      symbol: "Cake",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x015f807d0186f7e62810d0c597a23cb19ff57e4d",
    token0: {
      symbol: "BLZ",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x6e425b4fc4efd070dc0def1654a17946c7e6b3c4",
    token0: {
      symbol: "BAT",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0xb4c0c621b2edfe6c22585ebac56b0e634907b8a7",
    token0: {
      symbol: "COMP",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0xf13e007e181a8f57ed3a4d4cce0a9ff9e7241cef",
    token0: {
      symbol: "WBNB",
    },
    token1: {
      symbol: "AAVE",
    },
  },
  {
    id: "0xf726b3e81fa7166b9c2cfd7eb7fe8ccbcb6b1355",
    token0: {
      symbol: "SXP",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x0d70924695b6ae496f0a74a36bf79d47307dd519",
    token0: {
      symbol: "WBNB",
    },
    token1: {
      symbol: "IOTA",
    },
  },
  {
    id: "0x8b1f1f28a8ccbaa8a8bc1582921ece97ce99d9e1",
    token0: {
      symbol: "SNX",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0xc1c7a1d33b34019f82808f64ba07e77512a13d1a",
    token0: {
      symbol: "WBNB",
    },
    token1: {
      symbol: "BAKE",
    },
  },
  {
    id: "0x288ea5437c7aad045a393cee2f41e548df24d1c8",
    token0: {
      symbol: "NAUT",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0xb75724635a6cda850f08b578f23a568cedba099d",
    token0: {
      symbol: "NEAR",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x40afc7cbd0dc2be5860f0035b717d20afb4827b2",
    token0: {
      symbol: "AVAX",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x2b2c771e44af4c6f858598308e05fb89b23f11ce",
    token0: {
      symbol: "ZEC",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x649a5ad5135b4bd287e5aca8d41f4d5e1b52af5c",
    token0: {
      symbol: "AUTO",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x1696a65ea693593ba771b5a7afc54c8eaf4c20de",
    token0: {
      symbol: "BFT",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x789fd04bfbc64169104466ee0d48716e0452bcf6",
    token0: {
      symbol: "NUTS",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x924d3f2f94618e8ee837d4c2b8d703f0de12a57e",
    token0: {
      symbol: "WBNB",
    },
    token1: {
      symbol: "ONT",
    },
  },
  {
    id: "0x85d87c038917ec8949f12b06262bb9d7a1290db6",
    token0: {
      symbol: "BAT",
    },
    token1: {
      symbol: "ETH",
    },
  },
  {
    id: "0xacfdcf0486adc2421aac3ffc0923b9c56faebc47",
    token0: {
      symbol: "COTI",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0xfb6063f29af6dcd1fc03a8e221c6d91deabbe764",
    token0: {
      symbol: "JDI",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x744527700ceb261689df9862fcd0036f5771324c",
    token0: {
      symbol: "LYPTUS",
    },
    token1: {
      symbol: "BUSD",
    },
  },
  {
    id: "0x876ba49c4f438643ab33f871e14a54cbb897df49",
    token0: {
      symbol: "NRV",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x8a10489f1255fb63217be4cc96b8f4cd4d42a469",
    token0: {
      symbol: "CRUSH",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x1ea398a30f0f2a6ce00bebfe08fe11cd9df5afb6",
    token0: {
      symbol: "LYPTUS",
    },
    token1: {
      symbol: "WBNB",
    },
  },

  {
    id: "0xbf34598168b890e1fd9e845c118a80c4861220ff",
    token0: {
      symbol: "RUPEE",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x756d4406169273d99aac8366cf5eaf7865d6a9b9",
    token0: {
      symbol: "WBNB",
    },
    token1: {
      symbol: "TAPE",
    },
  },
  {
    id: "0xc2fef4bec915315bef9f6e8a06b2516e64d29d06",
    token0: {
      symbol: "bxBTC",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0xfc791965beacf6c0bcebcc4b8d165f0c0d35e82d",
    token0: {
      symbol: "RUPEE",
    },
    token1: {
      symbol: "BUSD",
    },
  },
  {
    id: "0xe6de19ae48969af0a6f78271e41d3ce47580eafb",
    token0: {
      symbol: "MOONLIGHT",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x5514e0e1da40a38e19d58e8b6e16226e16e183fa",
    token0: {
      symbol: "BANANA",
    },
    token1: {
      symbol: "BREW",
    },
  },
  {
    id: "0x5fcec12f1c7e57789f22289ef75fbdb1c6b4895d",
    token0: {
      symbol: "WBNB",
    },
    token1: {
      symbol: "DINOP",
    },
  },
  {
    id: "0xa3f0f63268df562c71051ac5e81460e857c32c12",
    token0: {
      symbol: "WBNB",
    },
    token1: {
      symbol: "SWAMP",
    },
  },
  {
    id: "0x656f1081715e0b9986446c35efb6b4b66199cc0a",
    token0: {
      symbol: "WBNB",
    },
    token1: {
      symbol: "CROW",
    },
  },
  {
    id: "0x44530667302c2655e8cd3d0365a799e9789f388d",
    token0: {
      symbol: "BANANA",
    },
    token1: {
      symbol: "LYPTUS",
    },
  },
  {
    id: "0x2073df355abeb7339be4ea573692dc97f0b6d508",
    token0: {
      symbol: "WBNB",
    },
    token1: {
      symbol: "BINGUS",
    },
  },
  {
    id: "0x0571c0a060dd4f1b9372ca236daa0e8f9f739990",
    token0: {
      symbol: "TWIN",
    },
    token1: {
      symbol: "BUSD",
    },
  },
  {
    id: "0xdb77fa37766dbf0d74bc9f0ad497f7cc887ea322",
    token0: {
      symbol: "TAKO",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x3b2ebd524bd5d3a31d4e47b96a8661153dcfff7b",
    token0: {
      symbol: "CROW",
    },
    token1: {
      symbol: "BUSD",
    },
  },
  {
    id: "0x67a8c4cd5fd2dabfacf9beca5dc228819a80c73e",
    token0: {
      symbol: "CRX",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0xb022b1f501c326d58e7b5baaca91f9c3acc5e906",
    token0: {
      symbol: "gRUPEE",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x44baf117d79d5313bea1fbba416e4067436e4bbe",
    token0: {
      symbol: "BANANA",
    },
    token1: {
      symbol: "NUTS",
    },
  },
  {
    id: "0xfeaf192c2662e5700bda860c58d2686d9cc12ec8",
    token0: {
      symbol: "TYPH",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0xb0ed855d390e783e2a7f1ffdbede5bc7b6cf3deb",
    token0: {
      symbol: "WBNB",
    },
    token1: {
      symbol: "MEMEX",
    },
  },
  {
    id: "0xc0acacab94006ede5c2705b65919b6f9573f9866",
    token0: {
      symbol: "WBNB",
    },
    token1: {
      symbol: "VOXb",
    },
  },
  {
    id: "0x095153e064a45d3e7043d4bc4dd7087852f0310c",
    token0: {
      symbol: "gRUPEE",
    },
    token1: {
      symbol: "BUSD",
    },
  },
  {
    id: "0x2c4747fa7d9e485881976f5f299a60a4a30b5252",
    token0: {
      symbol: "TAKO",
    },
    token1: {
      symbol: "BANANA",
    },
  },
  {
    id: "0xe5085ce5f12516ba3077edf4a3b58c2cc8faabcd",
    token0: {
      symbol: "BANANA",
    },
    token1: {
      symbol: "RUPEE",
    },
  },
  {
    id: "0xca21e3adb07a2f1a289ca1c5530021a6f8130dbc",
    token0: {
      symbol: "TAPS",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0xe4fba63b748175d2775bfe49c106a10800200bb6",
    token0: {
      symbol: "TAKO",
    },
    token1: {
      symbol: "BUSD",
    },
  },
  {
    id: "0xbd896f59baf9a624a7587de5d28b7ad3459342ba",
    token0: {
      symbol: "BANANA",
    },
    token1: {
      symbol: "CRX",
    },
  },
  {
    id: "0xd7903933b10504a7c67f191285a6a7e5a233fd3b",
    token0: {
      symbol: "GFCE",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0xa48271ff51900007d3b21cecf30fdc8ccb63fee6",
    token0: {
      symbol: "BANANA",
    },
    token1: {
      symbol: "SOUL",
    },
  },
  {
    id: "0xe1eaebfad38c5725b636582b0f0f83e98d102a55",
    token0: {
      symbol: "BUSD",
    },
    token1: {
      symbol: "MEMEX",
    },
  },
  {
    id: "0x268f002a3b8d2fac2aa2ba6d4b90d519ca0d1d46",
    token0: {
      symbol: "BANANA",
    },
    token1: {
      symbol: "HPS",
    },
  },
  {
    id: "0x988d345b3ac0459ab4870a7fc76d1de365e349c4",
    token0: {
      symbol: "BANANA",
    },
    token1: {
      symbol: "MARS",
    },
  },
  {
    id: "0x70ccf4cd3caf08b53577d2c58e5e22b6e3294bad",
    token0: {
      symbol: "Cake",
    },
    token1: {
      symbol: "TAKO",
    },
  },
  {
    id: "0x51bb531a5253837a23ce8de478a4941a71a4202c",
    token0: {
      symbol: "BANANA",
    },
    token1: {
      symbol: "BAKE",
    },
  },
  {
    id: "0xbc8cb82b11cd0f0050cf6c09a3cb61ed4e4ce1b2",
    token0: {
      symbol: "LOTUS",
    },
    token1: {
      symbol: "BUSD",
    },
  },
  {
    id: "0x88835c2e95ff0c2df9572658f80889fadedfc634",
    token0: {
      symbol: "APE",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x436bda511fb94276313d65c41bcf227d8112c87a",
    token0: {
      symbol: "GORIL",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x9949e1db416a8a05a0cac0ba6ea152ba8729e893",
    token0: {
      symbol: "Cake",
    },
    token1: {
      symbol: "BANANA",
    },
  },
  {
    id: "0xe152f30c2a69a7fdd0bd08224d40fb321db2b07f",
    token0: {
      symbol: "CHIPS",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0xdb854eb143fe767273ac1a6667b971c71073b4d9",
    token0: {
      symbol: "LOTUS",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x2f420f7a6d3594f8bc93955fe44493015e94fd34",
    token0: {
      symbol: "BLUE",
    },
    token1: {
      symbol: "BANANA",
    },
  },
  {
    id: "0x2457598552db0adfd1163f132f51a636d6b3342f",
    token0: {
      symbol: "WBNB",
    },
    token1: {
      symbol: "PMOT",
    },
  },
  {
    id: "0x8330e0814aa1f0dc1a61e4ed73e6d1315c7ad732",
    token0: {
      symbol: "DSL",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x77acd18484430203212dc67c9b5362d0abace8de",
    token0: {
      symbol: "MKC",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0xa63cc83e7308bbe742af2f83b0da489acc5d4423",
    token0: {
      symbol: "WBNB",
    },
    token1: {
      symbol: "TOASTZ",
    },
  },
  {
    id: "0xbe3e38918ca1180f0285fa18c3fa154d0dde6853",
    token0: {
      symbol: "Foxy",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x51a9771708d0471a0e592e8febb2c6b868e3d99b",
    token0: {
      symbol: "BANANA",
    },
    token1: {
      symbol: "BRICK",
    },
  },
  {
    id: "0x455254e9f1846f70184f586b56dffb82e5370dec",
    token0: {
      symbol: "TAPS",
    },
    token1: {
      symbol: "BUSD",
    },
  },
  {
    id: "0x6366dc2aa1e53c268aa2009a97609ad817948ea2",
    token0: {
      symbol: "PMOT",
    },
    token1: {
      symbol: "BUSD",
    },
  },
  {
    id: "0x717bcc6f9fcbce8343efb643c6c1fa55faa3e9c6",
    token0: {
      symbol: "SOUL",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x0a6dd2e402531009b0f13ffeba9df48625a86e72",
    token0: {
      symbol: "WBNB",
    },
    token1: {
      symbol: "GMEv3",
    },
  },
  {
    id: "0x40cf96943e17142ca87ad5040fb8ff2934e1b5ab",
    token0: {
      symbol: "AI",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x7d1272608eb8aa108bbfb3e803d225d1bd608d99",
    token0: {
      symbol: "SOUL",
    },
    token1: {
      symbol: "BUSD",
    },
  },
  {
    id: "0x774284dfcc38aa57089dee2faad12c3433a96aef",
    token0: {
      symbol: "FREE",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x3d0633d5fe3df8981870d18f66929e2df20ac688",
    token0: {
      symbol: "GLXC",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0xef3413e2cc9735d617372c03ed0b3db9e5b60b06",
    token0: {
      symbol: "GEN",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x6b234237bc3f4d5c34521f542876b877566b9b14",
    token0: {
      symbol: "GMEv3",
    },
    token1: {
      symbol: "BUSD",
    },
  },
  {
    id: "0x6ad64196b020fef0c477147310705ee170eab744",
    token0: {
      symbol: "BANANA",
    },
    token1: {
      symbol: "MKC",
    },
  },
  {
    id: "0xb4b818754a9702e519911bf8bd759aa0fad51fac",
    token0: {
      symbol: "MAME",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0xfbcf83d97d7d4c2a46b0d661f7303d82f871f00f",
    token0: {
      symbol: "BUTTER",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0xaacc5e96c441092d44c9abfa271a19b903a03745",
    token0: {
      symbol: "WBNB",
    },
    token1: {
      symbol: "MEW",
    },
  },
  {
    id: "0xabdb560be46b370c3f8ada45943208b4a74d57d0",
    token0: {
      symbol: "SHIT",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x9c87cae57f0962997d9bd66c24f3425d20543e3d",
    token0: {
      symbol: "BANANA",
    },
    token1: {
      symbol: "GFCE",
    },
  },
  {
    id: "0x7e74d582f47355afaa7f644547d530a738704ae5",
    token0: {
      symbol: "BANANA",
    },
    token1: {
      symbol: "GMEv3",
    },
  },
  {
    id: "0x0a96394dfc481a77623d8fb39fb1af5aee132c38",
    token0: {
      symbol: "WBNB",
    },
    token1: {
      symbol: "BPRCY",
    },
  },
  {
    id: "0x17b4a8b1da86f689dee10ee86f09f5630f850036",
    token0: {
      symbol: "BTCB",
    },
    token1: {
      symbol: "PMOT",
    },
  },
  {
    id: "0xf2d7590cb86bea32193293d1bc9dffaf379c3642",
    token0: {
      symbol: "BURGER",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0xaf604f2da39db50cf23ca0b32b7e4869cb869f2a",
    token0: {
      symbol: "KEYS#01",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x7aecf50a835a354b95c33b134f75f2e81d8f4465",
    token0: {
      symbol: "WBNB",
    },
    token1: {
      symbol: "TTDX",
    },
  },
  {
    id: "0x2ce820319047c407cb952060df5f7fb3d9a9a688",
    token0: {
      symbol: "BANANA",
    },
    token1: {
      symbol: "BIFI",
    },
  },
  {
    id: "0xf3411fe034c3643cd81418e82530e44b97553337",
    token0: {
      symbol: "WBNB",
    },
    token1: {
      symbol: "CFB",
    },
  },
  {
    id: "0x5c60efc9b169ace846f185efbb1a77efea2dbe3c",
    token0: {
      symbol: "WBNB",
    },
    token1: {
      symbol: "BSC",
    },
  },
  {
    id: "0x334e697022aeabba58385afb3abf3d9347c1b260",
    token0: {
      symbol: "WBNB",
    },
    token1: {
      symbol: "pCWS",
    },
  },
  {
    id: "0x93fa1a6357de25031311f784342c33a26cb1c87a",
    token0: {
      symbol: "Rocket",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0xbd41c7a29c71c1c46ba9646f51aba1e5c942eac5",
    token0: {
      symbol: "MPOO",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x84babfd6b60b6fd8327e3ef411279bdbb28acee3",
    token0: {
      symbol: "PARTS",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x3c8fa435cc89cdb9e9c427bec21e5b5926644807",
    token0: {
      symbol: "USDT",
    },
    token1: {
      symbol: "MAME",
    },
  },
  {
    id: "0xedf50beb1034fb7709d632af7d6ad793543a03b6",
    token0: {
      symbol: "ETH",
    },
    token1: {
      symbol: "PMOT",
    },
  },
  {
    id: "0xc1d321b1f53b70f4489bf65bbf8e767c99b869c7",
    token0: {
      symbol: "1INCH",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0xcf2c3af91b5a55e283a8a8c2932b88009b557b4a",
    token0: {
      symbol: "bMXX",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x41c748907d2dd9c351bb23e979720356e6f08adc",
    token0: {
      symbol: "USDC",
    },
    token1: {
      symbol: "GMEv3",
    },
  },
  {
    id: "0x2a6ed2b649c16121e28b0441093ad72f99db619e",
    token0: {
      symbol: "XBN",
    },
    token1: {
      symbol: "BUSD",
    },
  },
  {
    id: "0x1573c166cba0d51ab69e8d310cb9af5d6737d56b",
    token0: {
      symbol: "NUTS",
    },
    token1: {
      symbol: "BUSD",
    },
  },
  {
    id: "0xc64187324684f11b913ca707bc63b80e32e870bc",
    token0: {
      symbol: "ALLOY",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x0c2851d0055e28cfa0c2dacb0b0a064db8e5caac",
    token0: {
      symbol: "Bits",
    },
    token1: {
      symbol: "BANANA",
    },
  },
  {
    id: "0xecb4591e5565267c8ee176fedd0a87806c08d228",
    token0: {
      symbol: "TOOM",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0xd165cd69b44a1505036141234f4c981c09ccae57",
    token0: {
      symbol: "Cake",
    },
    token1: {
      symbol: "GMEv3",
    },
  },
  {
    id: "0xddf4eeb3b395bd9837ed952847880073825f5f38",
    token0: {
      symbol: "BFT",
    },
    token1: {
      symbol: "BUSD",
    },
  },
  {
    id: "0x904ebd7472af075f01956dfab7692cbe41d0f916",
    token0: {
      symbol: "WNYC",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x36f0ab7c7cf9c1a20b33db317c75efdfada087a6",
    token0: {
      symbol: "TRVC",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x76fd62ea7cd4f2678b72c129e1181b47cf1d7edb",
    token0: {
      symbol: "XRP",
    },
    token1: {
      symbol: "BANANA",
    },
  },
  {
    id: "0xcd1e0b85b72ea3ecdf8a4b79c7bf9bcff5113829",
    token0: {
      symbol: "USDT",
    },
    token1: {
      symbol: "USDC",
    },
  },
  {
    id: "0x4254d1bedcc154dcb05c3bbb0a454bc08160e2dc",
    token0: {
      symbol: "SAFEP",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x516da4837998d48230fd727c7ba42de48ab5c806",
    token0: {
      symbol: "NFTG",
    },
    token1: {
      symbol: "BUSD",
    },
  },
  {
    id: "0xb42632f3cc0b12f4acb1c98ec2407fecaa5d9261",
    token0: {
      symbol: "BANANA",
    },
    token1: {
      symbol: "MAME",
    },
  },
  {
    id: "0x26bbcc178308d6ec014e65bf8f70cc14caf4ccd6",
    token0: {
      symbol: "SAPU",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x3ca316ddb2e9551bf80295e219cf4794c33a67fb",
    token0: {
      symbol: "Rocket",
    },
    token1: {
      symbol: "BANANA",
    },
  },
  {
    id: "0xf579a6196d6cc8c2c40952ece57345abbd589c91",
    token0: {
      symbol: "NAUT",
    },
    token1: {
      symbol: "BANANA",
    },
  },
  {
    id: "0x4f867309909e01c4b83f1227f0ede3d3eeb0ec6d",
    token0: {
      symbol: "ADA",
    },
    token1: {
      symbol: "USDC",
    },
  },
  {
    id: "0x186a2d0a8c455731245dccf58244b700b8cafd87",
    token0: {
      symbol: "MASH",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0xa71e27f80d0b781316764de67fc2bb59f5ffd571",
    token0: {
      symbol: "ETB",
    },
    token1: {
      symbol: "WBNB",
    },
  },
  {
    id: "0x0a79586ae8d07a5739a99b5334983620040fa76f",
    token0: {
      symbol: "MATIC",
    },
    token1: {
      symbol: "BUSD",
    },
  },
];

export const PAIR_NOT_EXISTS = "PAIR_NOT_EXISTS";
export const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

export { contractAddresses, supportedPairs };

export interface ArrivalPoem {
  lines: string[];
  title: string;
  author: string;
}

type PoemPool = ArrivalPoem[];

function buildPoem(lines: string[], title: string, author: string): ArrivalPoem {
  return { lines, title, author };
}

const sameCityPoems: PoemPool = [
  buildPoem(['正是江南好风景', '落花时节又逢君'], '江南逢李龟年', '杜甫'),
  buildPoem(['相逢意气为君饮', '系马高楼垂柳边'], '少年行二首 其一', '王维'),
  buildPoem(['与君离别意', '同是宦游人'], '送杜少府之任蜀州', '王勃'),
];

const japanNearbyPoems: PoemPool = [
  buildPoem(['海内存知己', '天涯若比邻'], '送杜少府之任蜀州', '王勃'),
  buildPoem(['山川异域', '风月同天'], '绣袈裟衣缘', '长屋'),
  buildPoem(['劝君更尽一杯酒', '西出阳关无故人'], '送元二使安西', '王维'),
];

const eastAsiaPoems: PoemPool = [
  buildPoem(['青山一道同云雨', '明月何曾是两乡'], '送柴侍御', '王昌龄'),
  buildPoem(['但愿人长久', '千里共婵娟'], '水调歌头', '苏轼'),
  buildPoem(['同来望月人何处', '风景依稀似去年'], '江楼感旧', '赵嘏'),
];

const mediumDistancePoems: PoemPool = [
  buildPoem(['海上生明月', '天涯共此时'], '望月怀远', '张九龄'),
  buildPoem(['此时相望不相闻', '愿逐月华流照君'], '春江花月夜', '张若虚'),
  buildPoem(['孤帆远影碧空尽', '唯见长江天际流'], '黄鹤楼送孟浩然之广陵', '李白'),
];

const farDistancePoems: PoemPool = [
  buildPoem(['浮云游子意', '落日故人情'], '送友人', '李白'),
  buildPoem(['相去万余里', '各在天一涯'], '古诗十九首 其六', '佚名'),
  buildPoem(['我寄愁心与明月', '随君直到夜郎西'], '闻王昌龄左迁龙标遥有此寄', '李白'),
];

function pickPoem(pool: PoemPool, seed: number) {
  return pool[Math.abs(seed) % pool.length];
}

export function getArrivalPoem(countryName: string, distance: number, seed = 0): ArrivalPoem {
  const isJapan = countryName === 'Japan';

  if (isJapan && distance < 180) {
    return pickPoem(sameCityPoems, seed);
  }

  if (isJapan && distance < 1600) {
    return pickPoem(japanNearbyPoems, seed);
  }

  if (distance < 4000) {
    return pickPoem(eastAsiaPoems, seed);
  }

  if (distance < 8000) {
    return pickPoem(mediumDistancePoems, seed);
  }

  return pickPoem(farDistancePoems, seed);
}

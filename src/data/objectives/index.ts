import {
  aghonObjective1,
  aghonObjective2,
  aghonObjective3,
  aghonObjective4,
  aghonObjective5,
  aghonObjective6,
  aveniaObjective1,
  aveniaObjective2,
  aveniaObjective3,
  aveniaObjective4,
  aveniaObjective5,
  aveniaObjective6,
  kazanObjective1,
  kazanObjective2,
  kazanObjective3,
  kazanObjective4,
  kazanObjective5,
  kazanObjective6,
  cnidariaObjective1,
  cnidariaObjective2,
  cnidariaObjective3,
  cnidariaObjective4,
  cnidariaObjective5,
  cnidariaObjective6,
  xawskilObjective1,
  xawskilObjective2,
  xawskilObjective3,
  xawskilObjective4,
  xawskilObjective5,
  xawskilObjective6,
  northProyliaObjective1,
  northProyliaObjective2,
  northProyliaObjective3,
  northProyliaObjective4,
  northProyliaObjective5,
  northProyliaObjective6,
} from '../../images'

const stuff = `
3 towers
2 towers
6 ruin spaces
2 crystals
5 villages

space with min 3 coins

village adjacent to tower
2 villages adjacent to ice
2 villages adjacent to trading posts
2 villages adjacent to crystals
village along northern border
village adjacent to ruin

villages on 3 different lands
villages on 5 different lands
villages on 3 different terrains
village on region 5 or bigger
2 villages on mountains
2 villages on same land
3 villages on same region type
villages in 3 different regions 3 spaces or smaller

2 trading posts on cities 3 or greater
trading post on city 5 or greater
trading posts on 3 different terrains

trade route involving ice

trade route worth at least 12
trade route worth at least 16

ruins adjacent to 3 different terrains
3 ruins along border

2 ruins on ice
3 ruins of the same type
ruins on each unique type
ruins A and J
ruins B and D

2 cities and 2 ruins in unbroken chain

northeastern tower and ruin C

1 space on westmost land
`
export const objectives = {
  aghon: [
    { imageUrl: aghonObjective1 },
    { imageUrl: aghonObjective2 },
    { imageUrl: aghonObjective3 },
    { imageUrl: aghonObjective4 },
    { imageUrl: aghonObjective5 },
    { imageUrl: aghonObjective6 },
  ],
  avenia: [
    { imageUrl: aveniaObjective1 },
    { imageUrl: aveniaObjective2 },
    { imageUrl: aveniaObjective3 },
    { imageUrl: aveniaObjective4 },
    { imageUrl: aveniaObjective5 },
    { imageUrl: aveniaObjective6 },
  ],
  kazan: [
    { imageUrl: kazanObjective1 },
    { imageUrl: kazanObjective2 },
    { imageUrl: kazanObjective3 },
    { imageUrl: kazanObjective4 },
    { imageUrl: kazanObjective5 },
    { imageUrl: kazanObjective6 },
  ],
  cnidaria: [
    { imageUrl: cnidariaObjective1 },
    { imageUrl: cnidariaObjective2 },
    { imageUrl: cnidariaObjective3 },
    { imageUrl: cnidariaObjective4 },
    { imageUrl: cnidariaObjective5 },
    { imageUrl: cnidariaObjective6 },
  ],
  xawskil: [
    { imageUrl: xawskilObjective1 },
    { imageUrl: xawskilObjective2 },
    { imageUrl: xawskilObjective3 },
    { imageUrl: xawskilObjective4 },
    { imageUrl: xawskilObjective5 },
    { imageUrl: xawskilObjective6 },
  ],
  northProylia: [
    { imageUrl: northProyliaObjective1 },
    { imageUrl: northProyliaObjective2 },
    { imageUrl: northProyliaObjective3 },
    { imageUrl: northProyliaObjective4 },
    { imageUrl: northProyliaObjective5 },
    { imageUrl: northProyliaObjective6 },
  ],
}

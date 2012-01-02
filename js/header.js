var BETS, BLOCKUI, CF_ACE, CF_EIGHT, CF_FIVE, CF_FOUR, CF_JACK, CF_KING, CF_NINE, CF_NONE, CF_QUEEN, CF_SEVEN, CF_SIX, CF_TEN, CF_THREE, CF_TWO, CS_CLUBS, CS_DIAMONDS, CS_HEARTS, CS_NONE, CS_SPADES, GROWLUI, GS_BLINDS, GS_CANCEL, GS_DELAYED_START, GS_FLOP, GS_PREFLOP, GS_RIVER, GS_SHOWDOWN, GS_TURN, HC_FLUSH, HC_FOUR_KIND, HC_FULL_HOUSE, HC_HIGH_CARD, HC_PAIR, HC_STRAIGHT, HC_STRAIGHT_FLUSH, HC_THREE_KIND, HC_TWO_PAIR, MAX_PLAYER, PS_ALL_IN, PS_AUTOPLAY, PS_BET, PS_EMPTY, PS_FOLD, PS_MAKEUP_BB, PS_MUCK, PS_OUT, PS_PLAY, PS_RESERVED, PS_SIT_OUT, PS_WAIT_BB, RANKS;

PS_EMPTY = 0;

PS_PLAY = 1;

PS_FOLD = 2;

PS_WAIT_BB = 4;

PS_SIT_OUT = 8;

PS_MAKEUP_BB = 16;

PS_ALL_IN = 32;

PS_BET = 64;

PS_RESERVED = 128;

PS_AUTOPLAY = 256;

PS_MUCK = 512;

PS_OUT = 1024;

CF_ACE = 13;

CF_KING = 12;

CF_QUEEN = 11;

CF_JACK = 10;

CF_TEN = 9;

CF_NINE = 8;

CF_EIGHT = 7;

CF_SEVEN = 6;

CF_SIX = 5;

CF_FIVE = 4;

CF_FOUR = 3;

CF_THREE = 2;

CF_TWO = 1;

CF_NONE = 0;

CS_SPADES = 4;

CS_HEARTS = 3;

CS_DIAMONDS = 2;

CS_CLUBS = 1;

CS_NONE = 0;

HC_HIGH_CARD = 0;

HC_PAIR = 1;

HC_TWO_PAIR = 2;

HC_THREE_KIND = 3;

HC_STRAIGHT = 4;

HC_FLUSH = 5;

HC_FULL_HOUSE = 6;

HC_FOUR_KIND = 7;

HC_STRAIGHT_FLUSH = 8;

GS_PREFLOP = 0;

GS_FLOP = 1;

GS_TURN = 2;

GS_RIVER = 3;

GS_DELAYED_START = 4;

GS_BLINDS = 5;

GS_SHOWDOWN = 6;

GS_CANCEL = 254;

MAX_PLAYER = 9;

RANKS = ["高牌", "一對", "兩對", "三條", "順子", "同花", "葫蘆", "四條", "同花順"];

BETS = [[5000, 1], [2000, 2], [1000, 3], [500, 4], [200, 5], [100, 6], [50, 7], [20, 8], [10, 9], [5, 10], [2, 11], [1, 12]];

BLOCKUI = {
  'width': "400px",
  'color': "#ffffff",
  'border-radius': "8px",
  'border': "3px solid #174f75",
  'background-color': "rgba(15, 38, 61, 0.8)",
  'text-shadow': "1px 1px 1px #929da7",
  '-webkit-box-shadow': "2px 2px 2px black",
  'top': '200px'
};

GROWLUI = {
  width: '350px',
  right: '10px',
  border: 'none',
  padding: '5px',
  backgroundColor: '#000',
  '-webkit-border-radius': '10px',
  '-moz-border-radius': '10px',
  opacity: .6,
  color: '#fff',
  top: '630px',
  left: '500px'
};

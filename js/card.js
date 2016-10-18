/**
 * Created by 从楠楠 on 2016/10/13.
 */
// {
//     type: number(普通牌) 0 |func（功能牌） 1 | all（万能牌）2,
//     content: [0-9] | [+2(0), back(1), stop(2)]| [+4(0), all(1)]，
//     color: [0, 1, 2, 3, 4] // 红绿黄蓝 黑色

//     canSend:
//     choosed:
// }

const TYPE_NUMBER = 0;
const TYPE_FUNC = 1;
const TYPE_ALL = 2;

const CONTENT_ALL_COLOR = "全色";
const CONTENT_BACK = "回";
const CONTENT_STOP = "停";

const CONTENT = [[0,1,2,3,4,5,6,7,8,9],["+2", CONTENT_BACK, CONTENT_STOP],["+4", CONTENT_ALL_COLOR]];

const COLORS = ["red", "green", "yellow", "blue", "black"];

Array.prototype.remove = function(index) {
    if (index > -1) {
        this.splice(index, 1);
    }
};

// 把原始的html格式化成正确显示的html
function formatCard(origin, options){
    return origin.replace("{0}", options[0]).replace("{1}", options[1]).replace("{2}", options[2]);
}
// 获取卡牌对应的html块，返回string
var getCardHtml = function(c, index){
    var normalCard = '<div id="my-card-{2}" class="card"> <div class="card-inner {0}"> <div class="card-content-inner"> <p class="card-content">{1}</p> </div> </div> </div>';
    var allColor = '<div id="my-card-{2}" class="card"> <div class="card-inner black"> <div class="card-content-inner"> <div class="card-all-color"> <div class="card-all-color-item red"></div> <div class="card-all-color-item blue"></div> <div class="card-all-color-item yellow"></div> <div class="card-all-color-item green"></div>  </div> </div> </div> </div>';

    var background_class = COLORS[c.color];
    var content = CONTENT[c.type][c.content];

    if (content == CONTENT_ALL_COLOR){
        return allColor;
    } else{
        return formatCard(normalCard, [background_class, content, index]);
    }
};

// 出出去的牌跟手牌的显示效果不太一样
var getSendCardHtml = function(c){
    var normalCard = '<div class="card card-absolute sended-card"> <div class="card-inner {0}"> <div class="card-content-inner"> <p class="card-content">{1}</p> </div> </div> </div>';
    var allColor = '<div class="card card-absolute sended-card"> <div class="card-inner {0}"> <div class="card-content-inner"> <div class="card-all-color"> <div class="card-all-color-item red"></div> <div class="card-all-color-item blue"></div> <div class="card-all-color-item yellow"></div> <div class="card-all-color-item green"></div>  </div> </div> </div> </div>';

    var background_class = COLORS[c.color];
    var content = CONTENT[c.type][c.content];

    if (content == CONTENT_ALL_COLOR){
        return formatCard(allColor, [background_class, content, 0]);
    } else{
        return formatCard(normalCard, [background_class, content, parseInt(Math.random() * 1000000)]);
    }
};

// 获取所有卡牌 未洗牌
var getAllCards = function(){
    var cards = [];
    // 初始化普通牌 1-9各有8张 0 4张
    for(var i = 0; i <= 9; i ++) {
        for (var j = 0; j < 4; j++) {
            var c = {};
            c.type = 0;
            c.content = i;
            c.color = j;
            cards.push(c);

            if (i != 0){
                var c2 = {};
                c2.type = 0;
                c2.content = i;
                c2.color = j;
                cards.push(c2);
            }
        }
    }

    // 三种功能牌，各有8张
    for (i = 0; i <= 2; i ++){
        for (j = 0; j < 4; j++) {
            c = {};
            c.type = 1;
            c.content = i;
            c.color = j;
            cards.push(c);

            c = {};
            c.type = 1;
            c.content = i;
            c.color = j;
            cards.push(c);
        }
    }

    // 万能牌，各有4张
    for (i = 0; i < 4; i ++){
        c = {};
        c.type = 2;
        c.content = 0;
        c.color = 4;
        cards.push(c);

        c = {};
        c.type = 2;
        c.content = 1;
        c.color = 4;
        cards.push(c);
    }
    return cards;
};

var createCard = function(type, content, color){
    var card = {};
    card.type = type;
    card.content = content;
    card.color = color;
    return card;
};

// 洗牌 返回洗好的牌
var shuffle = function(cards){
    var length = cards.length;
    var shuffledCards = new Array(length);
    for (var i = 0; cards.length > 0;  i++){
        var r = parseInt(Math.random()*cards.length);
        shuffledCards[i] = cards[r];
        cards.remove(r);
    }
    return shuffledCards;
};

var getShuffledCards = function () {
    return shuffle(getAllCards());
};

// 如果第二个卡是黑色，则是同色
var sameColor = function(c1, c2){
    return c1.color == c2.color || c2.color == 4;
};

var sameTypeAndContent = function(c1, c2){
    return c1.type == c2.type && c1.content == c2.content;
};

var isPlusTwo = function(c){
    return c.type == TYPE_FUNC && c.content == 0;
};

var isPlusFour = function(c){
    return c.type == TYPE_ALL && c.content == 0;
};

var isAllColor = function(c){
    return c.type == TYPE_ALL && c.content == 1;
};

var isBack = function(c){
    return c.type == TYPE_FUNC && c.content == 1;
};

var isStop = function(c){
    return c.type == TYPE_FUNC && c.content == 2;
};

// 当前牌是否能出，注：“停”牌直接被game.js跳过，所以这里对“停”的判断，并不是停当前机器人。 修改card.canSend属性 true:false
var isCardCanSend = function(lastCard, card){

    if (lastCard == null){
        card.canSend = true;
        return true;
    }

    // 先判断 +4 全色.  后面不用判断+4 全色
    if (card.type == TYPE_ALL){
        if (card.content == 0) {
            // +4
            card.canSend = true;
            return true;
        } else{
            // 全色
            if (lastCard.type == TYPE_ALL){
                if (lastCard.content == 0){
                    card.canSend = false;
                    return false;
                } else{
                    card.canSend = true;
                    return true;
                }
            }
        }
    }

    // lastCard 0-9
    if(lastCard.type == TYPE_NUMBER){
        // 同色，或者不同色但同卡
        if (sameColor(lastCard, card) || sameTypeAndContent(lastCard, card) || isPlusFour(card) || isAllColor(card)){
            card.canSend = true;
            return true;
        } else{
            card.canSend = false;
            return false;
        }
    }

    //+2 回 停
    if (lastCard.type == TYPE_FUNC){
        if (lastCard.content == 0){
            // +2
            if (isPlusTwo(card) || isPlusFour(card)){
                card.canSend = true;
                return true;
            } else{
                card.canSend = false;
                return false;
            }
        } else if (lastCard.content == 1){
            // 回
            if (sameColor(lastCard, card) || isBack(card) || isPlusFour(card) || isAllColor(card)){
                card.canSend = true;
                return true;
            } else{
                card.canSend = false;
                return false;
            }
        } else{
            // 停
            if (sameColor(lastCard, card) || isStop(card) || isPlusFour(card) || isAllColor(card)){
                card.canSend = true;
                return true;
            } else{
                card.canSend = false;
                return false;
            }
        }
    }

    // +4
    if (isPlusFour(lastCard)){
        // +4 或者 颜色和选择的+4相同的+2
        if (isPlusFour(card) || (isPlusTwo(card) && sameColor(lastCard, card))){
            card.canSend = true;
            return true;
        } else{
            card.canSend = false;
            return false;
        }
    } else if (isAllColor(lastCard)){
        // 颜色相同的任何牌
        if (sameColor(lastCard, card)){
            card.canSend = true;
            return true;
        } else{
            card.canSend = false;
            return false;
        }
    }
};
var isCardsCanSend = function(lastCards, allCards){
    if(null == lastCards){
        for (var i = 0; i < allCards.length; i ++){
            allCards[i].canSend = true;
        }
        return ;
    }

    for (i = 0; i < allCards.length; i ++){
        isCardCanSend(lastCards, allCards[i]);
    }
};


var getCardScore = function(c){
    if (c.type == TYPE_NUMBER){
        return parseInt(c.content);
    } else if (c.type == TYPE_FUNC){
        return 20;
    } else {
        return 50;
    }
};

var getCardsScore = function(cs){
    var count = 0;
    for (var i = 0; i < cs.length; i ++){
        var a = getCardScore(cs[i]);
        count += a;
    }
    return count;
};
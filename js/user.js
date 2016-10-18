/**
 * Created by 从楠楠 on 2016/10/14.
 */

var createUser = function(){
    var user = {};

    user.cards = [];

    user.setGame = function(game, index){
        user.game = game;
        user.index = index;
    };

    user.getCards = function(cards){
        user.cards = user.cards.concat(cards);
        pageNotifier.notifyUserGetCards(cards, user.cards);
    };

    // lastCard:上家出的卡, currentPlusNumber当前累加的牌，“+4”、“+2”的功能牌累加，包括当前lastCard
    user.active = function(lastCard, currentPlusNumber){
        //TODO 取消其他player的激活状态 并显示自己为激活
        pageNotifier.notifyActive(user.index);

        // 把所有卡设置为不能出
        user.initCards();

        // 给所有能使用的卡加上 canSend = true属性，不能使用是false
        isCardsCanSend(lastCard, user.cards);

        // 没找到能出的牌
        if ( ! user.cards.some(function (e) {return e.canSend;})){
            setTimeout(function(){user.game.sendCard(user.index, null, -1);}, 300);
            return 0;
        }

        // 遍历所有的能出的牌，加上card-can-send属性，便于hover以及选择操作
        pageNotifier.notifyUserCardStateChange(user.cards);

    };

    user.initCards = function(){
        for (var i = 0; i < user.cards.length; i ++){
            user.cards[i].canSend = false;
        }
    };

    user.chooseCard = function(index){
        // 其他的设置为未选中
        user.cards.forEach(function (c, i, array) {
            if(i == index){
                user.cards[i].choosed = true;
            } else{
                user.cards[i].choosed = false;
            }
        });

        pageNotifier.notifyUserCardStateChange(user.cards);

        pageNotifier.toggleChooseColorPanel(false);

        // 显示确定 或者 选色 按钮
        var card = user.cards[index];
        if (card.type == TYPE_ALL){
            // 打开选色面板
            pageNotifier.toggleEnsurePanel(false);
            pageNotifier.toggleChooseColorPanel(true);
        } else {
            // 打开确定面板
            pageNotifier.toggleEnsurePanel(true);
        }
    };
    
    user.chooseColor = function(color){
        user.choosedColor = color;
        pageNotifier.toggleChooseColorPanel(false);
        pageNotifier.toggleEnsurePanel(true);
    };

    user.sendCard = function(){
        var card = user.getChoosedCard();
        if (card.type == TYPE_ALL){
            card.color = user.choosedColor;
        }
        user.cards.splice(card.currentIndex, 1);
        pageNotifier.notifyCardsNumberChanged(user.index, user.cards);
        pageNotifier.notifyUserCardChange(game.user.cards);
        user.game.sendCard(user.index, card, card.currentIndex);
    };

    user.giveUpSend = function(){
        var card = null;
        pageNotifier.notifyUserCardChange(game.user.cards);
        user.game.sendCard(user.index, card, -1);
    };

    /**
     *
     * @returns {*} 返回选择的card对象，并添加属性currentIndex，当前位置
     */
    user.getChoosedCard = function(){
       for (var i = 0; i < user.cards.length; i ++){
            if (user.cards[i].choosed){
                user.cards[i].currentIndex = i;
                return user.cards[i];
            }
       }
        return null;
    };

    

    return user;
};
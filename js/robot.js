/**
 * Created by 从楠楠 on 2016/10/14.
 */

var createRobot = function(){
    var robot = {};

    robot.cards = [];

    robot.setGame = function(game, index){
        robot.game = game;
        robot.index = index;
    };

    robot.getCards = function(cards){
        robot.cards = robot.cards.concat(cards);
        pageNotifier.notifyCardsNumberChanged(robot.index, robot.cards);
    };

    // lastCard:上家出的卡, currentPlusNumber当前累加的牌，“+4”、“+2”的功能牌累加，包括当前lastCard
    robot.active = function(lastCard, currentPlusNumber){
        //TODO 取消其他player的激活状态 并显示自己为激活
        pageNotifier.notifyActive(robot.index);

        robot.initCards();

        // 给所有能使用的卡加上 canSend = true属性，不能使用是false
        isCardsCanSend(lastCard, robot.cards);

        var cardToSend = {};
        robot.considerSendCard(cardToSend);

        // 没找到能出的牌
        if (cardToSend.card == null){
            setTimeout(function(){robot.game.sendCard(robot.index, cardToSend.card, cardToSend.index);}, 300);
            return 0;
        }

        // 如果是+4或者全色，随机选择一个非黑色
        if (isAllColor(cardToSend.card) || isPlusFour(cardToSend.card)){
            cardToSend.card.color = parseInt(Math.random() * 4);
        }

        // 调用game进行出牌
        robot.cards.splice(cardToSend.index, 1);
        pageNotifier.notifyCardsNumberChanged(robot.index, robot.cards);
        setTimeout(function(){robot.game.sendCard(robot.index, cardToSend.card, cardToSend.index);}, 300);
        // 出牌后不可以有任何操作，因为出牌是同步操作！！！！！
    };

    robot.initCards = function(){
        for (var i = 0; i < robot.cards.length; i ++){
            robot.cards[i].canSend = false;
        }
    };

    /**
     *
     * @param cardToSend 输出参数  返回两个属性 card index
     * @returns {number}
     */
    robot.considerSendCard = function(cardToSend){
        cardToSend.card = null;
        cardToSend.index = -1;
        for (var i = 0; i < robot.cards.length; i ++){
            if (robot.cards[i].canSend){
                cardToSend.card = robot.cards[i];
                cardToSend.index = i;
                return 0;
            }
        }
    };

    return robot;
};
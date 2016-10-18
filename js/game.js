/**
 * Created by 从楠楠 on 2016/10/14.
 */

var game = {};
var PLAYER_COUNT = 6;
var INIT_CARD_COUNT = 7;

var playerAvatars = new Array(PLAYER_COUNT);
var playerNames = new Array(PLAYER_COUNT);
var playerScores = [0,0,0,0,0,0];

game.start = function(){
    // 初始化一些全局的东西
    var avatars = ["avatar_01.jpg", "avatar_02.jpg", "avatar_03.jpg", "avatar_04.jpg", "avatar_05.jpg", "avatar_06.jpg"
    , "avatar_07.jpg", "avatar_08.jpg", "avatar_09.jpg", "avatar_10.jpg", "avatar_11.jpg", "avatar_12.jpg"];
    var names = ["往左歪的鸣人", "占卜婆婆", "胡子叔叔", "草帽路飞", "某不知名刺客", "呲牙的索隆"
        , "已故的迈克尔▪杰克逊", "V字仇杀队", "大龙猫", "往右歪的鸣人", "海绵叔叔", "小和尚"];

    var j = 0;
    for (var i = 0; i < PLAYER_COUNT; i ++){
        j = parseInt(Math.random() * avatars.length);
        playerAvatars[i] = avatars.splice(j, 1);
        playerNames[i] = names.splice(j, 1);
    }

    game.currentSeason = 0;

    //初始化排名信息
    game.showPlayerOrder();

    // 游戏是否自动结束
    game.autoEnd = false;

    pageNotifier.setPlayerInfo(playerAvatars, playerNames);

    game.onStart();
};

game.onStart = function(){
    // game.players
    game.createPlayers();

    // 显示场次信息
    game.currentSeason ++;
    pageNotifier.showCurrentSeason(game.currentSeason);

    // 初始化牌
    game.cards = getShuffledCards();

    // 初始化Player手牌
    game.initPlayerCards();

    // game.outCount
    game.outCount = 0;

    // 累加的牌的数量 +2 +4
    game.plusCard = 0;

    // 初始化上一张出来的牌
    game.lastCard = null;

    // 暂时从user开始，以后会随机开始位置
    game.direction = true;
    game.currentActivePlayerIndex = 0;
    game.players[game.currentActivePlayerIndex].active(game.lastCard, game.plusCard);
};

game.restart = function(){
    pageNotifier.notifyRestart();
    if ( ! game.autoEnd){
        game.shouldRestart = true;
    }
    setTimeout(function(){game.onStart();}, 1000);
};

game.createPlayers = function(){
    game.players = new Array(PLAYER_COUNT);
    game.players[0] = createUser();
    game.user = game.players[0];
    game.players[0].setGame(game, 0, pageNotifier);
    for(var i = 1; i < PLAYER_COUNT; i ++){
        game.players[i] = createRobot();
        game.players[i].setGame(game, i, pageNotifier);
    }
};

game.getNextPlayer = function(){
    if (game.direction){
        game.currentActivePlayerIndex ++;
    } else {
        game.currentActivePlayerIndex --;
    }

    if (game.currentActivePlayerIndex >= PLAYER_COUNT){
        game.currentActivePlayerIndex = game.currentActivePlayerIndex - PLAYER_COUNT;
    }
    if (game.currentActivePlayerIndex < 0){
        game.currentActivePlayerIndex = game.currentActivePlayerIndex + PLAYER_COUNT;
    }
    return game.players[game.currentActivePlayerIndex];
};

game.backDirection = function(){
    game.direction = !game.direction;
    pageNotifier.notifyDirectionChanged(game.direction);
};

game.initPlayerCards = function(){
    for(var i = 0; i < PLAYER_COUNT; i ++){
        game.players[i].getCards(game.popCards(INIT_CARD_COUNT));
    }
};

// 从牌堆顶部取count张牌
game.popCards = function(count){
    var outCards = new Array(count);
    if (count >= game.cards.length){
        var newCards = getShuffledCards();
        game.cards = newCards.concat(game.cards);
    }
    for(var i = 0; i < count; i ++){
        outCards[i] = game.cards.pop();
    }
    return outCards;
};

/**
 *
 * @param playerIndex 玩家位置
 * @param card 出的牌
 * @param cardIndex 如果是玩家出牌，则给出该牌的位置，方便做动画效果
 */
game.sendCard = function(playerIndex, card, cardIndex){

    if (game.shouldRestart){
        game.shouldRestart = false;
        return 0;
    }

    var nextPlayer;

    // 没有出牌
    if (null == card){

        // 1.正常色卡，没牌出
        // 2.连加后没牌出

        if (0 == game.plusCard){
            nextPlayer = game.players[playerIndex];
            nextPlayer.getCards(game.popCards(1));
            nextPlayer = game.getNextPlayer();
            game.delayActive(nextPlayer);
            consoleLog(" 没有出牌，拿一张牌", playerNames[playerIndex] + "：");
            return 0;
        } else{
            nextPlayer = game.players[playerIndex];
            nextPlayer.getCards(game.popCards(game.plusCard));
            consoleLog(" 没有出牌，拿" + game.plusCard + "张牌" , playerNames[playerIndex] + "：");
            game.plusCard = 0;
            game.lastCard = createCard(TYPE_ALL, 1, game.lastCard.color);
            game.delayActive(nextPlayer);
            return 0;
        }
    }

    isCardCanSend(game.lastCard, card);
    if ( ! card.canSend){
        // alert(playerNames[playerIndex] + "： " + COLORS[card.color] + " " + CONTENT[card.type][card.content] + "\n出牌错误，请重新出牌. " + playerIndex + "号");
        consoleLog(" 出牌错误，重新出牌" , playerNames[playerIndex] + "：");
        game.delayActive(game.players[playerIndex]);
        return 0;
    }

    game.outCount ++;

    // 出牌动画
    if (playerIndex == 0){
        // 如果是玩家出牌，则有不同的动画效果
        pageNotifier.showRobotSendCardAnim(playerIndex, card, game.outCount);
    } else {
        // 机器人出牌动画
        pageNotifier.showRobotSendCardAnim(playerIndex, card, game.outCount);
    }

    // 桌子上牌过多
    if (game.outCount >= 11){
        var c = game.outCount;
        game.outCount = 4;
        setTimeout(function(){pageNotifier.clearOutCardWhenTooMany(c, 4);}, 1000);
    }

    consoleLog(COLORS[card.color] + " " + CONTENT[card.type][card.content], playerNames[playerIndex] + "： ");

    // 判断当前player是否还有牌，没牌的话结束游戏
    if (game.players[playerIndex].cards.length <= 0){

        game.autoEnd = true;

        // 计分
        for (var ii = 0; ii < PLAYER_COUNT; ii ++){
            playerScores[ii] += getCardsScore(game.players[ii].cards);
        }

        game.showPlayerOrder();

        setTimeout(function(){alert("游戏结束：" + playerNames[playerIndex] + " 获胜");}, 600);
        return ;
    }

    game.lastCard = card;


    // 回 停 +2，+4 正常牌
    if (isBack(card)){
        game.backDirection();
        var player = game.getNextPlayer();
    } else if (isStop(card)){
        player = game.getNextPlayer();
        player = game.getNextPlayer();
    } else if (isPlusTwo(card)){
        player = game.getNextPlayer();
        game.plusCard += 2;
    } else if (isPlusFour(card)){
        player = game.getNextPlayer();
        game.plusCard += 4;
    } else {
        player = game.getNextPlayer();
    }

    game.delayActive(player);

    //TODO 0 UNO
};

var orderUser = function(p1, p2){
    if (p1.score <= p2.score){
        return 1;
    } else{
        return -1;
    }
};

game.showPlayerOrder = function(){
    var us = new Array(PLAYER_COUNT);
    for (var i = 0; i < PLAYER_COUNT; i ++){
        var u = {};
        u.name = playerNames[i];
        u.score = playerScores[i];
        us[i] = u;
    }
    us.sort(orderUser);
    pageNotifier.showUserOrder(us);
};


game.delayActive = function(player){
    setTimeout(function(){player.active(game.lastCard, game.plusCard);}, 800);
};
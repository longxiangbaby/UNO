/**
 * Created by yu on 2016/10/13.
 */

var pageNotifier = {};

pageNotifier.notifyActive = function(index){
    var robotId;
    for (var i = 0; i < PLAYER_COUNT; i ++){
        robotId = "#robot-" + i;
        $(robotId).removeClass("active");
    }
    robotId = "#robot-" + index;
    $(robotId).addClass("active");
};

pageNotifier.notifyUserGetCards = function(newCards, totalCards){
    for (var i = 0; i < newCards.length; i ++){
        $(".my-cards").append($(getCardHtml(newCards[i], i)));
    }
    var id = "robot-" + 0;
    $("#"+ id + " .left-card-number").text(totalCards.length);
    if (totalCards.length <= 1){
        $("#"+id + " .left-card-number").addClass("left-one");
    } else{
        $("#"+id + " .left-card-number").removeClass("left-one");
    }
};

pageNotifier.notifyUserCardStateChange = function(cards, fromIndex, size){
    if (fromIndex == undefined){
        fromIndex = 0;
    }
    if (size == undefined){
        size = cards.length;
    }
    var cardsElem = $(".my-cards").children();
    var endIndex = fromIndex + size;
    for (var i = fromIndex; i < endIndex; i ++){
        if (cards[i].canSend){
            $(cardsElem[i]).addClass("card-can-send");
            $(cardsElem[i]).removeClass("card-can-not-send");
        } else{
            $(cardsElem[i]).removeClass("card-can-send");
            $(cardsElem[i]).addClass("card-can-not-send");
        }

        if (cards[i].choosed){
            $(cardsElem[i]).addClass("card-choosed");
        } else{
            $(cardsElem[i]).removeClass("card-choosed");
        }
    }
};

pageNotifier.notifyUserCardChange = function (cards) {
    $(".my-cards").html("");

    for (var i = 0; i < cards.length; i++) {
        $(".my-cards").append($(getCardHtml(cards[i], i)));
    }
    var id = "robot-" + 0;
    $("#" + id + " .left-card-number").text(cards.length);
    if (cards.length <= 1) {
        $("#" + id + " .left-card-number").addClass("left-one");
    } else {
        $("#" + id + " .left-card-number").removeClass("left-one");
    }
};

pageNotifier.notifyCardsNumberChanged = function(robotIndex, totalCards){
    var id = "robot-" + robotIndex;
    $("#"+ id + " .left-card-number").text(totalCards.length);
    if (totalCards.length <= 1){
        $("#"+id + " .left-card-number").addClass("left-one");
    } else{
        $("#"+id + " .left-card-number").removeClass("left-one");
    }
};

pageNotifier.notifyDirectionChanged = function(direction){
    var topElem = $(".direction-top");
    var bottomElem =  $(".direction-bottom");
    if (direction){
        topElem.removeClass("direction-right");
        topElem.addClass("direction-left");
        bottomElem.addClass("direction-right");
        bottomElem.removeClass("direction-left");
    } else{
        topElem.removeClass("direction-left");
        topElem.addClass("direction-right");
        bottomElem.addClass("direction-left");
        bottomElem.removeClass("direction-right");
    }
};

pageNotifier.toggleChooseColorPanel = function(show){
    if (show){
        $(".option-color-panel").show();
    } else{
        $(".option-color-panel").hide();
    }
};

pageNotifier.toggleEnsurePanel = function(show){
    if (show){
        $(".option-do-panel").show();
    } else{
        $(".option-do-panel").hide();
    }
};

pageNotifier.notifyRestart = function(){
    $(".my-cards").html("");
    $(".wrapper").children(".sended-card").remove() ;
    $(".history-panel").children().remove();
};

var positionData = [
    {"opacity":"0.4","top": "400px", "left": "500px"}
    , {"opacity":"0.4", "top": "270px", "left": "900px"}
    , {"opacity": "0.4", "top": "100px", "left": "800px"}
    , {"opacity": "0.4", "top": "100px", "left": "550px"}
    , {"opacity": "0.4", "top": "100px", "left": "250px"}
    , {"opacity": "0.4", "top": "270px", "left": "300px"}];
pageNotifier.showRobotSendCardAnim = function(playerIndex, card, outIndex){
    var left = outIndex * 55 + 230;
    var top = 270;

    var content = getSendCardHtml(card);
    var ele = $(content);
    ele.css(positionData[playerIndex]);

    $(".wrapper").append(ele);
    ele.animate({
        opacity: "1.0",
        left: left + "px",
        top: top + "px"
    });
    // class sended-card

};

pageNotifier.showCurrentSeason = function(e){
    $(".score-panel h3 span").text(e);
};

pageNotifier.showUserOrder = function(us){
    console.log(us);
    us.forEach(function(e, index){
        var ps = $(".score-panel p#order-" + (index + 1));
        ps.children(".order-name").text(e.name);
        ps.find(".order-score").text(e.score);
    });
};

pageNotifier.clearOutCardWhenTooMany = function(currentCount, toCount){
    var mLeft = ((currentCount - toCount) * 55);

    var children = $(".wrapper").children(".sended-card");

    for (var i = 0; i < currentCount - toCount; i ++){
        children[i].remove();
    }

    children = $(".wrapper").children(".sended-card");
    children.animate({
        left: "-=" + mLeft + "px"
    });
};

pageNotifier.setPlayerInfo = function(avatars, names){
    var id = "";
    for (var i = 0; i < avatars.length; i ++){
        id = "robot-" + i;
        $("#"+id + " img").attr("src", "img/avatar/"+avatars[i]);
        $("#"+id + " p.user-name").text(names[i]);
    }
};

var consoleLog = function(content, name){
    var div = $(".history-panel");

    var top = div[0].scrollTop;
    var sHeight = div[0].scrollHeight;
    var height = div.height();

    var c = $("<p>" + "<span>" + name + "</span>" + content + "</p>");
    div.append(c);
    if (top + height >= sHeight){
        div.scrollTop(div[0].scrollHeight);
    }
};

$(function(){

    $(document).on("click", ".card-can-send", function(e){
        game.user.chooseCard($(this).index());
    });

    $(document).on("click", ".option-color", function(e){
        // 位置跟颜色一一对应
        game.user.chooseColor($(this).index());
    });

    $(".option-button-sure").click(function(){
        game.user.sendCard();
        pageNotifier.toggleEnsurePanel(false);
    });

    $(".option-button-giveup").click(function(){
        game.user.giveUpSend();
        pageNotifier.toggleEnsurePanel(false);
    });

    $(".restart").click(function(){
        game.restart();
    });

    var test_func = false;
    if (test_func){
        test();
    } else {
        game.start();
    }
});

window.addEventListener("beforeunload", function(event) {
    event.returnValue = "不知道这个东西有什么用";
});

/**
 * 测试函数
 */
function test(){
    var card1 = createCard(2, 1, 3);
    var card2 = createCard(0, 4, 2);
}
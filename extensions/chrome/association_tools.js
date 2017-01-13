var associationTag = "ассоциация:";
var AssociationTag = "Ассоциация:";
var targetPage = "/questions/";
var targetPageException = "/questions/ask";
var associationHelpText = "Вопрос был ассоциирован участником";
var associateHelpText = "ассоциировать";
var addAssociationHelpText = "Ассоциировать";
var questionApiEndpoint = "https://api.stackexchange.com/2.2/questions/{id}?order=desc&sort=votes&site=stackoverflow"

init();

function init() {
    var uri = document.baseURI;
    if (!uri.includes(targetPage) || uri.includes(targetPageException))
        return;

    if (processExistedAssociation())
        return;
    processAddingAssociationLink();
}

function processAddingAssociationLink() {
    $("#question .post-menu").append("<a id='associate-link' class=''>" + associateHelpText + "</a>");
    $("#associate-link").click(function() {
        var event;

        if (document.createEvent) {
            event = document.createEvent("HTMLEvents");
            event.initEvent("click", true, true);
        } else {
            event = document.createEventObject();
            event.eventType = "click";
        }
        event.eventName = "click";
        var element = $(".question .js-add-link")[0];
        if (document.createEvent) {
            element.dispatchEvent(event);
        } else {
            element.fireEvent("on" + event.eventType, event);
        }

        $(".question .comment-form textarea").text(associationTag + " ");
        $(".question .comment-form input").val(addAssociationHelpText);
        event.preventDefault();
    });
}

function processExistedAssociation() {
    var targetComment = $(".question .comment:contains('" + associationTag + "')");
    if (targetComment == undefined || targetComment.length == 0) {
        targetComment = $(".question .comment:contains('" + AssociationTag + "')");
        if (targetComment == undefined || targetComment.length == 0)
            return false;
    }

    if ($(targetComment).find(".comment-copy a").length == 0) {
        console.error("Unexpected comment structure");
        return false;
    }

    createAssociationBox(targetComment);
    return true;
}

function createAssociationBox(targetComment) {
    var soEnLink = $(targetComment).find(".comment-copy a").attr("href");
    var ownerProfileLink = $(targetComment).find(".owner").attr("href");
    var ownerName = $(targetComment).find(".owner").text();
    var postTime = $(targetComment).find(".relativetime-clean").text();
    var absTime = $(targetComment).find(".relativetime-clean").attr("title");

    var soEnQuestionId = questionId(soEnLink);
    var soRuUserId = userId(ownerProfileLink);

    loadQuestionFromStackOverflowInEnglish(soEnQuestionId,
        function(data) {
            var tmp = associationBoxTemplate();
            var template = $(tmp);
            $(template).find(".association-author").text(ownerName);
            $(template).find(".association-author").attr("href", ownerProfileLink);
            $(template).find(".association-link").text(stripHtml(data.items[0].title));
            $(template).find(".association-link").attr("href", soEnLink);
            $(template).find(".relativetime-clean").text(postTime);
            $(template).find(".relativetime-clean").attr("title", absTime);
            var commnetId = $(targetComment).attr("id");

            $("#" + commnetId).css("display", "none");
            $(".question > table > tbody > tr:first-child").after(template);
            $(".association-as-comment").click(function(event) {
                $("#" + commnetId).css("display", "block");
                $(".association-root").css("display", "none");
                event.preventDefault();
            });
        },
        function() {
            console.error("Could not load question #" + soEnQuestionId + " from Stack Overflow in English");
        });
}

function questionId(uri) {
    var id = /\/\d+\//.exec(uri)
    if (!id)
        return -1

    return id[0].replace(/\//g, "");
}

function userId(uri) {
    var id = /\d+/.exec(uri)
    if (!id)
        return -1

    return id[0].replace(/\//g, "");
}

function loadQuestionFromStackOverflowInEnglish(id, onSuccess, onError) {
    var url = questionApiEndpoint.replace(/\{id\}/g, id);
    $.ajax({
        url: url,
        method: 'GET',
        success: onSuccess,
        error: onError
    });
}

function stripHtml(html) {
    var div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
}

function associationBoxTemplate() {
    return '<tr class="association-root"><td class="special-status" colspan="2"><div class="question-status"><h2>' + associationHelpText + ' <a class="association-author"></a> <span class="relativetime-clean"></span></h2><p><b>Stack Overflow на английском</b>: <a class="association-link"></a><a class="association-as-comment comment-delete delete-tag" style="visibility: visible;" href="#"></a></p></div></td></tr>'
}
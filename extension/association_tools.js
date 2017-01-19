var associationTag = "ассоциация:";
var AssociationTag = "Ассоциация:";
var targetPage = "/questions/";
var targetPageException = "/questions/ask";
var associationHelpText = "Вопрос был ассоциирован участником";
var associateHelpText = "ассоциировать";
var addAssociationHelpText = "Ассоциировать";
var questionApiEndpoint = "https://api.stackexchange.com/2.2/questions/{id}?order=desc&sort=votes&site=stackoverflow"
var commetsToQuestionApiEndpoint = "https://api.stackexchange.com/2.2/questions/{id}/comments?order=desc&sort=creation&site=ru.stackoverflow&filter=!9YdnSNaN(";

init();

function init() {
    var uri = document.baseURI;
    if (!uri.includes(targetPage) || uri.includes(targetPageException))
        return;

    var localisedQuestionId = questionId(uri);
    processExistedAssociation(localisedQuestionId);
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

function processExistedAssociation(localisedQuestionId) {
    function ifThereIsNoAssociation() {
        processAddingAssociationLink();
    }
    loadCommentsFromLocalizedStackOverflow(localisedQuestionId, function(data) {
        if (data == undefined || data.items.length == 0) {
            ifThereIsNoAssociation();
            return;
        }

        var uploadedTargetComment = null;
        for (index = 0; index < data.items.length; index++) {
            var item = data.items[index];
            if (item.body.toLowerCase().includes(associationTag)) {
                uploadedTargetComment = item;
                break;
            }
        }

        if (uploadedTargetComment == null) {
            ifThereIsNoAssociation();
            return;
        }

        var tmpCommnetHtml = "<div>" + uploadedTargetComment.body + "</div>";
        var linkToSOen = $(tmpCommnetHtml).find("a").attr("href");
        if (linkToSOen.length == 0) {
            console.error("Unexpected comment structure");
            ifThereIsNoAssociation();
            return;
        }

        createAssociationBox(uploadedTargetComment, linkToSOen);

    }, function() {
        ifThereIsNoAssociation();
    });
}

function createAssociationBox(uploadedTargetComment, linkToSOen) {
    var absTime = (new Date(uploadedTargetComment.creation_date * 1000)).toISOString().replace("T", " ").replace(".000", "");
    var soEnQuestionId = questionId(linkToSOen);

    loadQuestionFromStackOverflowInEnglish(soEnQuestionId,
        function(data) {
            var tmp = associationBoxTemplate();
            var template = $(tmp);
            $(template).find(".association-author").text(uploadedTargetComment.owner.display_name);
            $(template).find(".association-author").attr("href", uploadedTargetComment.owner.link);
            $(template).find(".association-link").text(stripHtml(data.items[0].title));
            $(template).find(".association-link").attr("href", linkToSOen);
            //$(template).find(".relativetime-clean").text();
            $(template).find(".relativetime-clean").attr("title", absTime);

            var prevDisplayState = $("#comment-" + uploadedTargetComment.comment_id).css("display");
            $("#comment-" + uploadedTargetComment.comment_id).css("display", "none");
            $(".question > table > tbody > tr:first-child").after(template);
            $(".association-as-comment").click(function(event) {
                $("#comment-" + uploadedTargetComment.comment_id).css("display", prevDisplayState);
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

function loadHelper(url, onSuccess, onError) {
    $.ajax({
        url: url,
        method: 'GET',
        success: onSuccess,
        error: onError
    });
}

function loadQuestionFromStackOverflowInEnglish(id, onSuccess, onError) {
    var url = questionApiEndpoint.replace(/\{id\}/g, id);
    loadHelper(url, onSuccess, onError)
}

function loadCommentsFromLocalizedStackOverflow(id, onSuccess, onError) {
    var url = commetsToQuestionApiEndpoint.replace(/\{id\}/g, id);
    loadHelper(url, onSuccess, onError)
}

function stripHtml(html) {
    var div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
}

function associationBoxTemplate() {
    return '<tr class="association-root"><td class="special-status" colspan="2"><div class="question-status"><h2>' + associationHelpText + ' <a class="association-author"></a> <span class="relativetime-clean"></span></h2><p><b>Stack Overflow на английском</b>: <a class="association-link"></a><a class="association-as-comment comment-delete delete-tag" style="visibility: visible;" href="#"></a></p></div></td></tr>'
}
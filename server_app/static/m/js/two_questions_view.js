var popupIdTag = "#two-question-popup";
var popupContentTag = popupIdTag + " .overlay-content";
var soEnContentTag = popupContentTag + " .so-en-content";
var soIntContentTag = popupContentTag + " .so-int-content";
var addAssociationTag = "#add-association";
var closePopupMenuTag = "#close-popup";

function show(soen_id, soint_id) {
    console.log("SOen: " + soen_id + ", SOint: " + soint_id);
    
    loadOverlayQuestion(soen_id, STACKOVERFLOW_IN_ENGLISH, soEnContentTag);
    loadOverlayQuestion(soint_id, INTERNATIONAL_STACKOVERFLOW, soIntContentTag);
    
    showPopup();

    $(".close-button").off("click");
    $(".close-button").click(function(){
        closePopup();
    })
    $(addAssociationTag).off("click");
    $(addAssociationTag).click(function(){
        addAssociation(soen_id, soint_id);
    });
    $(closePopupMenuTag).off("click");
    $(closePopupMenuTag).click(function(){
        closePopup();
    })
}

function showPopup() {
    $(popupIdTag).css("display", "block");
    $(popupIdTag).css("height", "100%");
}

function closePopup() {
    $(popupIdTag).css("height", "0%");
    $(popupIdTag).css("display", "none");
}

function addAssociation(soen_id, soint_id) {
    addAssUrl = addAssociationAndpoint + "?soen_id=" + soen_id + "&soint_id=" + soint_id
    loadHelper(addAssUrl, function(data) {
        if (data.comment_id != undefined) {
            alert(localeManager.associationWasAdded + data.comment_id)
            window.location = document.referrer;
            return;
        }
    })
}

function loadOverlayQuestion(questionId, site, rootTag) {
    url = getQuestionApiEndPoint(site, true, true, "activity", "desc").replace(/\{id\}/g, questionId);
    loadHelper(url, function(data) {
        question = data.items[0];
        updateOverlayQuestion(question, rootTag);
        loadOverlayAnswers(question, site, rootTag);
    }, function() {
        closePopup();
        console.log("Cannot load a question: " + questionId);
    })
}

function loadOverlayAnswers(question, site, rootTag) {
    var ids = "";
    for (index = 0; index < question.answers.length; index++) {
        ids += question.answers[index].answer_id;
        if (index < (question.answers.length -1)) {
            ids += ";";
        }
    }
    url = "/api/get-answers/?ids=" + ids + "&site=" + site;
    loadHelper(url, function(data) {
        answers = data.items;
        updateOverlayAnswers(answers, rootTag);
    }, function() {
        closePopup();
        console.log("Cannot load answers: " + question.question_id);
    })
}

function updateOverlayQuestion(question, rootTag) {
    $(rootTag + " .question-header h1").text(stripHtml(question.title));
    $(rootTag + " .question-body").html(question.body);
    var tags = createTagsDiv(question.tags);
    $(rootTag + " .question-taglist").empty();
    $(rootTag + " .question-taglist").append(tags);
    updateOverlayPostMenu($(rootTag), question, localeManager.asked);
}

function updateOverlayAnswers(answers, rootTag) {
    $(rootTag + " .answers").empty();
    for (index = 0; index < answers.length; index++) {
        var item = answers[index];
        var tmp = getAnswerTemaplate();
        var template = $(tmp);
        $(template).find(".answer-body").html(item.body);

        updateOverlayPostMenu(template, item, localeManager.answeredStr);

        $(rootTag + " .answers").append(template.html());
    }
}

function updateOverlayPostMenu(template, item, postedStr) {
    $(template).find(".post-menu .ref-to-post").text(localeManager.LinkStr);
    $(template).find(".post-menu .ref-to-post").attr("href", item.link);       
    $(template).find(".post-menu ul .score-help").text(localeManager.scoreHelpStr);        
    $(template).find(".post-menu ul .score").text(item.score);
    $(template).find(".post-menu ul .posted-help").text(postedStr);        

    var posted = new Date(parseInt(1000 * item.creation_date));
    $(template).find(".post-menu ul .posted").text(getDate(posted));        

    $(template).find(".post-menu .user-gravatar32 a").attr("href", item.owner.link);        
    $(template).find(".post-menu .user-gravatar32 img").attr("src", item.owner.profile_image);        

    $(template).find(".post-menu .user-details a").attr("href", item.owner.link);    
    $(template).find(".post-menu .user-details a").text(item.owner.display_name);    
}

function getAnswerTemaplate() {
    return `
        <div>
          <div class="answer">
            <div class="answer-body post-text"></div>
            <table class="post-menu">
                <tr>
                    <td>
                        <ul class="links">
                            <li><span class="score-help"></span> <span class="score"></span></li>
                            <li><span class="posted-help"></span> <span class="posted"></span></li>
                            <li><a target="_blank" class="ref-to-post"></a></li>
                        </ul>
                    </td>
                    <td align="right" style="width: 10%;" class="post-signature">
                        <div class="user-info">
                          <div class="user-gravatar32">
                            <a target="_blank" >
                                <div class="gravatar-wrapper-32">
                                    <img src="" alt="" width="32" height="32">
                                </div>
                            </a>
                          </div>
                          <div class="user-details">
                            <a></a>
                          </div>
                        </div>
                    </td>
                </tr>
            </table>
          </div>
        </div>
    `
}
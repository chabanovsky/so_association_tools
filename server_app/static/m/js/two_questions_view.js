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
            alert("Association has been added with id: " + data.comment_id)
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
    $(rootTag + " .question-taglist").append(tags);
}

function updateOverlayAnswers(answers, rootTag) {
    for (index = 0; index < answers.length; index++) {
        var item = answers[index];
        var tmp = getAnswerTemaplate();
        var template = $(tmp);
        $(template).find(".answer-body").html(item.body);

        $(rootTag + " .answers").append(template.html());
    }
}

function getAnswerTemaplate() {
    return `
        <div>
          <div class="answer">
            <div class="answer-body post-text"></div>
          </div>
        </div>
    `
}
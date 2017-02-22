
var addAssociationEndpoint = "/api/add_association"
var skipEndpoint = "/api/skip_most_viewed_question"
var requestTranslationEndpoint = "/api/translation_request"

var questionIdTag = "#question-id";
var questionViewsTag = "#question-views"
var searchButtonTag = "#search-button";
var searchInputTag = "#search-input";
var searchResultTag = "#search-results";
var searchBoxTag = "#search-association-box"
var skipActionTag = "#skip";
var skipLabelTag = "#skip-label";
var requestTranslationActionTag = "#translate-request";
var requestTranslationLabelTag = "#translate-request-label";
var requestTranslationCountTag = "#translate-request-count";
var soQuestionId = -1;
var question = null;

$(document).ready(function() {
    soQuestionId = parseInt($(questionIdTag).text());
    init(function(isSucceeded) {
        if (!isSucceeded)
            return;
        updatePage();
    });

    setupActions();
})

function setupActions() {
    if (parseInt($(skipLabelTag).text()) == 1) {
        $(skipActionTag).text(localeManager.addToTheListStr);
    } else {
        $(skipActionTag).text(localeManager.skipStr);
    }
    var requestAddString = "";
    var initialRequestCount = parseInt($($(requestTranslationCountTag).text()));
    if (initialRequestCount > 0) {
        requestAddString = " (" + initialRequestCount + ")"
    }
    if (parseInt($(requestTranslationLabelTag).text()) == 1) {
        $(requestTranslationActionTag).text(localeManager.cancelTranslationRequestStr);
    } else {
        $(requestTranslationActionTag).text(localeManager.requestTranslationStr + requestAddString);
    }
    $(skipActionTag).click(function(event){
        url = skipEndpoint + "?soen_id=" + soQuestionId;
        loadHelper(url, function(data) {
            // canceled == true means that it's on the list, 
            // add the "skip" lable to the button
            if (data.status) {
                $(skipActionTag).text(localeManager.skipStr);
            } else {
                $(skipActionTag).text(localeManager.addToTheListStr);
            }
        }, function(data) {
            console.log("Something went wrong during skipping/returning a question");
        })
    });
    $(requestTranslationActionTag).click(function(event){
        url = requestTranslationEndpoint + "?soen_id=" + soQuestionId;
        loadHelper(url, function(data) {
            if (data.status) {
                $(requestTranslationActionTag).text(localeManager.requestTranslationStr + requestAddString);
            } else {
                $(requestTranslationActionTag).text(localeManager.cancelTranslationRequestStr);
            }
        }, function(data) {
            console.log("Something went wrong during requesting translation/canceling it for a question");
        })
    });
}

function thereAreResults(flag) {
    if (flag) {
        $(searchBoxTag + " .help h3").text(localeManager.candidatesForAssociationStr);
    } else {
        $(searchBoxTag + " .help h3").text(localeManager.notFoundInGogle);
    }
}

function init(onInitCompleted) {
    url = getQuestionApiEndPoint(STACKOVERFLOW_IN_ENGLISH, true, false, "activity", "desc").replace(/\{id\}/g, soQuestionId);
    loadHelper(url, function(data) {
        question = data.items[0];
        onInitCompleted(true);
    }, function() {
        onInitCompleted(false);
    })
    $(searchButtonTag).click(function(event) {
        event.preventDefault();
        $(searchResultTag).empty();
        var theQuery = $(searchInputTag).val();
        $(searchBoxTag + " .help h3").text(localeManager.searchingStr);
        queryGoogle(theQuery, function(result) {
            if (result == null || result == undefined || result.items == undefined || result.items.length == 0) {
                thereAreResults(false);
                return;
            }
            createCandidatesForAssociationList(result.items);
        });
    });
}

function updatePage() {
    $("#question-header h2").text(stripHtml(question.title));
    $("#question-body").html(question.body);
    var tags = createTagsDiv(question.tags);
    $("#question-taglist").append(tags);
    updatePostMenu($("#question"), question, localeManager.asked);
    var viewed = '<li><span>' + localeManager.viewdStr + "</span>  <span>" + $(questionViewsTag).text() + '</span></li>'
    $("#question .post-menu ul").prepend(viewed);

    updatePrettify();
    updateSearchInput();
}

function updatePrettify() {
    [].forEach.call(document.getElementsByTagName("pre"), function(el) {
        el.classList.add("prettyprint");
    });
    prettyPrint();
}

function updateSearchInput() {
    $(searchInputTag).val(stripHtml(question.title));
    $(searchInputTag).keypress(function (e) {
        if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
            $(searchButtonTag).click();
            return false;
        } else {
            return true;
        }
    });
    $(searchInputTag).focus();
    $(this).scrollTop(0);
}

function createCandidateIdsString(items) {
    var ids = "";
    var addedIds = new Array();

    for (var index = 0; index < items.length; index++) {
        var skipp = false;
        var item = items[index];
        var id = questionId(item.link);

        if (id < 0)
            continue;

        for (subIndex = 0; subIndex < addedIds.length; subIndex++) {
            if (addedIds[subIndex] == id) {
                skipp = true;
                break;
            }
        }

        if (skipp)
            continue;

        ids += id + ";";
        addedIds.push(id);
    }

    return ids.replace(/;+$/, "");
}

function createCandidatesForAssociationList(items) {
    var ids = createCandidateIdsString(items);
    url = getQuestionApiEndPoint(INTERNATIONAL_STACKOVERFLOW, true, false, "activity", "desc").replace(/\{id\}/g, ids);
    loadHelper(url, function(data) {
            function withContext(soen_id, soint_id) {

                $(".soint-" + soint_id).click(function(event) {
                    if (event.target.localName == "a") {
                        return;
                    }

                    event.preventDefault();
                    show(soen_id, soint_id);
                });

                $(".soint-" + soint_id + " .candidate-title a").click(function(event) {
                    event.preventDefault();
                    show(soen_id, soint_id);
                });
            }
            var found = false;
            for (var index = 0; index < data.items.length; index++) {
                var item = data.items[index];
                if (item.answer_count < 1) {
                    continue;
                }   

                var tmp = candidateForAssociationTemplate();
                var template = $(tmp);

                $(template).find(".association-candidate .question-id").text(item.question_id);
                $(template).find(".association-candidate .candidate-title a").text(stripHtml(item.title));
                $(template).find(".association-candidate .candidate-body").html(item.body);
                $(template).find(".association-candidate").addClass("soint-" + item.question_id)
                var tags = createTagsDiv(item.tags);
                $(template).find(".candidate-taglist").append(tags);
                var asked = new Date(parseInt(1000 * item.creation_date));
                $(template).find(".candidate-bar .owner span").text(localeManager.asked + getDate(asked));
                $(template).find(".candidate-bar .owner a").text(item.owner.display_name);
                $(template).find(".candidate-bar .owner a").attr("href", item.owner.link);

                $(searchResultTag).append(template.html());
                withContext(soQuestionId, item.question_id)
                found = true;
            }
            thereAreResults(found);
            updatePrettify();
        },
        function() {

        });
}

function candidateForAssociationTemplate() {
    return `
    <div>
        <div class="association-candidate">
            <div class="candidate-title">
                <a href="#">
                    <span class="question-id" style="display:none">
                </a>
            </div>
            <div class="candidate-body post-text">
            </div>
            <div class="candidate-bar">
                <div class="candidate-taglist"></div>
                <div class="owner">
                    <span></span>
                    <a target="_blank"></a>
                </div>
            </div>
            <div class="candidate-menu">
            </div>
        </div>
    </div>
    `
}
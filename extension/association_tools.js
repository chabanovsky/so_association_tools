var associationTag = "ассоциация:";
var AssociationTag = "Ассоциация:";
var associationHelpText = "Вопрос был ассоциирован участником";
var associateHelpText = "ассоциировать";
var addAssociationHelpText = "Ассоциировать";

var targetPage = "/questions/";
var targetPageException = "/questions/ask";

var stringTemplates = {
    questionApiEndpoint(id, sitename) { return `https://api.stackexchange.com/2.2/questions/${id}?order=desc&sort=votes&site=${sitename}`; },
    commetsToQuestionApiEndpoint(id) { return `https://api.stackexchange.com/2.2/questions/${id}/comments?order=desc&sort=creation&site=ru.stackoverflow&filter=!9YdnSNaN(`; },
    querySESiteInfo(sitename) { return `https://api.stackexchange.com/2.2/info?site=${sitename}&filter=!2--kZCrbrZAvwtX1SWlK)` },
    associationBoxTemplate(owner, linkToSOen, enQuestionTitle, absTime, SE_SiteName) {
        return `
            <tr class="association-root">
                <td class="special-status" colspan="2">
                    <div class="question-status">
                        <h2>
                            ${associationHelpText}
                            <a class="association-author" href="${owner.link}">${owner.display_name}</a> <span title="${absTime}" class="relativetime-clean"></span>
                        </h2>
                        <p>
                            <b>${SE_SiteName}</b>: 
                            <a class="association-link" href="${linkToSOen}">${enQuestionTitle}</a>
                            <a class="association-as-comment comment-delete delete-tag" style="visibility: visible;" href="#"></a>
                        </p>
                    </div>
                </td>
            </tr>`;
    }
};

checkPage(document.baseURI)
    .then(loadCommentsFromLocalizedStackOverflow)
    .then(checkCommentsLoaded)
    .then(findTargetComment)
    .then(findLinkToSE)
    .then(getSEQuestionId)
    .then(processSEQuestion)
    .then(createAssociationBox)
    .catch(handleWrongPage)
    .then(processAddingAssociationLink);

function checkPage(uri) {
    return new Promise((resolve, reject) => {
        if (!uri.includes(targetPage) || uri.includes(targetPageException)) {
            reject('wrong page')
        } else {
            resolve(questionId(uri));
        }
    });
}

function handleWrongPage(rejectReason) {
    if (rejectReason == 'wrong page') return Promise.reject();
    console.info(rejectReason);
}
function checkCommentsLoaded(data) {
    return (data == undefined || data.items.length == 0)
        ? Promise.reject('comments not loaded')
        : data.items;
}
function findTargetComment(comments) {
    return comments.find(comment => comment.body.toLowerCase().includes(associationTag)) || Promise.reject('association comment not exists');
}
function findLinkToSE(comment) {
    var tmpCommnetHtml = parseTemplate(`<div>${comment.body}</div>`);

    var linkToSE = tmpCommnetHtml.querySelector("a").href;
    if (linkToSE.length == 0) {
        return Promise.reject("Unexpected comment structure");
    }
    return { comment, linkToSE }
}
function processAddingAssociationLink() {
    document.querySelector("#question .post-menu").appendChild(parseTemplate(`<a id='associate-link' class=''>${associateHelpText}</a>`));
    document.querySelector("#associate-link").addEventListener('click', function (e) {
        document.querySelector(".question .js-add-link").click();

        document.querySelector(".question .comment-form textarea").textContent = associationTag + " ";
        document.querySelector(".question .comment-form input").value = addAssociationHelpText;
        e.preventDefault();
    });
}

function getSEQuestionId({comment, linkToSE}) {
    var SE_Site = /:\/\/([^\/]+)\.com\//.exec(linkToSE)[1];
    console.log(SE_Site);
    var absTime = (new Date(comment.creation_date * 1000)).toISOString().replace("T", " ").replace(".000", "");
    var SE_QuestionId = questionId(linkToSE);
    return { comment, linkToSE, SE_QuestionId, absTime, SE_Site };
}

function processSEQuestion({ comment, linkToSE, SE_QuestionId, absTime, SE_Site }) {
    return Promise.all([
        loadQuestionFromStackExchange(SE_QuestionId, SE_Site),
        getSESiteName(SE_Site)
    ])
        .then(([{items: [SE_Question]}, {items: [{site: {name: SE_SiteName}}]}]) => ({ comment, linkToSE, SE_Question, absTime, SE_SiteName }));
}

function createAssociationBox({comment, linkToSE, SE_Question, absTime, SE_SiteName}) {
    var template = stringTemplates.associationBoxTemplate(comment.owner, linkToSE, stripHtml(SE_Question.title), absTime, SE_SiteName);
    var assocComment = document.querySelector(`#comment-${comment.comment_id}`)
    if (assocComment)
        assocComment.style.display = "none";

    document.querySelector(".question > table > tbody > tr:first-child").insertAdjacentHTML('afterend', template);
    document.querySelector(".association-as-comment").addEventListener('click', function (e) {
        var assocComment = document.querySelector(`#comment-${comment.comment_id}`)
        if (assocComment)
            assocComment.style.display = "";

        document.querySelector(".association-root").style.display = "none";
        e.preventDefault();
    });
}
function questionId(uri) {
    var id = /\/(\d+)\//.exec(uri)
    return id == null ? -1 : id[1];
}

function getJson(url) {
    return fetch(url, { method: 'GET' })
        .then((response) => response.json())
        .catch((...args) => console.log('error request', ...args));
}
function loadQuestionFromStackExchange(id, SE_Site) {
    console.info('load ' + SE_Site + ' question');
    var url = stringTemplates.questionApiEndpoint(id, SE_Site);
    return getJson(url);
}
function loadCommentsFromLocalizedStackOverflow(id) {
    console.info('load comments');
    var url = stringTemplates.commetsToQuestionApiEndpoint(id);
    return getJson(url);
}
function stripHtml(html) {
    return jQuery('<p>' + html + '</p>').text();
}

function getSESiteName(SE_Site) {
    return getJson(stringTemplates.querySESiteInfo(SE_Site));
}

function parseTemplate(template) {
    var parser = new DOMParser();
    return parser.parseFromString(template, 'text/html').body.firstElementChild;
}

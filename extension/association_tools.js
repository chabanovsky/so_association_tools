var associationTag = "ассоциация:";
var AssociationTag = "Ассоциация:";
var targetPage = "/questions/";
var targetPageException = "/questions/ask";
var associationHelpText = "Вопрос был ассоциирован участником";
var associateHelpText = "ассоциировать";
var addAssociationHelpText = "Ассоциировать";
var questionApiEndpoint = "https://api.stackexchange.com/2.2/questions/{id}?order=desc&sort=votes&site=stackoverflow"
var commetsToQuestionApiEndpoint = "https://api.stackexchange.com/2.2/questions/{id}/comments?order=desc&sort=creation&site=ru.stackoverflow&filter=!9YdnSNaN(";

checkPage(document.baseURI)
    .then(loadCommentsFromLocalizedStackOverflow)
    .then(checkCommentsLoaded)
    .then(findTargetComment)
    .then(findLinkToSO)
    .then(getEnQuestionId)
    .then(({ comment, linkToSOen, soEnQuestionId, absTime }) => loadQuestionFromStackOverflowInEnglish(soEnQuestionId).then(data => ({ comment, linkToSOen, enQuestion: data.items[0], absTime })))
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
    console.error(rejectReason);
}
function checkCommentsLoaded(data) {
    return (data == undefined || data.items.length == 0)
        ? Promise.reject()
        : data.items;
}
function findTargetComment(comments) {
    return comments.find(comment => comment.body.toLowerCase().includes(associationTag)) || Promise.reject();
}
function findLinkToSO(comment) {
    var tmpCommnetHtml = parseTemplate(`<div>${comment.body}</div>`);

    var linkToSOen = tmpCommnetHtml.querySelector("a").href;
    if (linkToSOen.length == 0) {
        console.error("Unexpected comment structure");
        return Promise.reject();
    }
    return { comment, linkToSOen }
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
function getEnQuestionId({comment, linkToSOen}) {
    var absTime = (new Date(comment.creation_date * 1000)).toISOString().replace("T", " ").replace(".000", "");
    var soEnQuestionId = questionId(linkToSOen);
    return { comment, linkToSOen, soEnQuestionId, absTime };
}
function createAssociationBox({comment, linkToSOen, enQuestion, absTime}) {
    var template = associationBoxTemplate(comment.owner, linkToSOen, stripHtml(enQuestion.title), absTime);
    var assocComment = document.querySelector(`#comment-${comment.comment_id}`)
    if (assocComment)
        assocComment.style.display = "none";

    document.querySelector(".question > table > tbody > tr:first-child").insertAdjacentHTML('afterend',template);
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
function loadQuestionFromStackOverflowInEnglish(id) {
    console.log('load en question');
    var url = questionApiEndpoint.replace(/\{id\}/g, id);
    return getJson(url);
}
function loadCommentsFromLocalizedStackOverflow(id) {
    console.log('load comments');
    var url = commetsToQuestionApiEndpoint.replace(/\{id\}/g, id);
    return getJson(url);
}
function stripHtml(html) {
    var div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
}
function associationBoxTemplate(owner, linkToSOen, enQuestionTitle, absTime) {
    return `
    <tr class="association-root">
        <td class="special-status" colspan="2">
            <div class="question-status">
                <h2>
                    ${associationHelpText}
                    <a class="association-author" href="${owner.link}">${owner.display_name}</a> <span title="${absTime}" class="relativetime-clean"></span>
                </h2>
                <p>
                    <b>Stack Overflow на английском</b>: 
                    <a class="association-link" href="${linkToSOen}">${enQuestionTitle}</a>
                    <a class="association-as-comment comment-delete delete-tag" style="visibility: visible;" href="#"></a>
                </p>
            </div>
        </td>
    </tr>`
}
function parseTemplate(template) {
    var parser = new DOMParser();
    return parser.parseFromString(template, 'text/html').body.firstElementChild;
}

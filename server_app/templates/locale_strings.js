
var localeManager = {
    answerStrings: [
        {{ ngettext('answer', 'answers', 1)|generate_string|safe }},
        {{ ngettext('answer', 'answers', 2)|generate_string|safe }},
        {{ ngettext('answer', 'answers', 5)|generate_string|safe }},
    ],
    scoreStrings: [
        {{ ngettext('vote', 'votes', 1)|generate_string|safe }},
        {{ ngettext('vote', 'votes', 2)|generate_string|safe }},
        {{ ngettext('vote', 'votes', 5)|generate_string|safe }},
    ],
    viewStrings: [
        {{ ngettext('view', 'views', 1)|generate_string|safe }},
        {{ ngettext('view', 'views', 2)|generate_string|safe }},
        {{ ngettext('view', 'views', 5)|generate_string|safe }},
    ],
    asked: {{ gettext('asked ')|generate_string|safe }},
    notFoundInGogle: {{ gettext('Google has not found anything by the query.')|generate_string|safe }},
    associationWasAdded: {{ gettext('Association has been added with id: ')|generate_string|safe }},
    LinkStr: {{ gettext('link')|generate_string|safe }},
    scoreHelpStr: {{ gettext('score')|generate_string|safe }},
    answeredStr: {{ gettext('answered')|generate_string|safe }},
    candidatesForAssociationStr: {{ gettext('Candidates for the association')|generate_string|safe }},
    searchingStr: {{ gettext('Searching...')|generate_string|safe }},
    viewdStr: {{ gettext('viewed')|generate_string|safe }},
    skipStr: {{ gettext('skip')|generate_string|safe }},
    addToTheListStr: {{ gettext('add to the list')|generate_string|safe }},
    requestTranslationStr: {{ gettext('request translation')|generate_string|safe }},
    cancelTranslationRequestStr: {{ gettext('cancel request')|generate_string|safe }}
}
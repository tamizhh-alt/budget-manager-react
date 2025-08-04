#!/bin/bash

export CORRECT_NAME="Tamilvendan"
export CORRECT_EMAIL="vtamizh335@gmail.com"

git filter-branch -f --env-filter '
OLD_EMAIL_1="rahulhaque@users.noreply.github.com"
OLD_EMAIL_2="49699333+dependabot[bot]@users.noreply.github.com"
CORRECT_NAME="Tamilvendan"
CORRECT_EMAIL="vtamizh335@gmail.com"

if [ "$GIT_COMMITTER_EMAIL" = "$OLD_EMAIL_1" ] || [ "$GIT_COMMITTER_EMAIL" = "$OLD_EMAIL_2" ]; then
    export GIT_COMMITTER_NAME="$CORRECT_NAME"
    export GIT_COMMITTER_EMAIL="$CORRECT_EMAIL"
fi
if [ "$GIT_AUTHOR_EMAIL" = "$OLD_EMAIL_1" ] || [ "$GIT_AUTHOR_EMAIL" = "$OLD_EMAIL_2" ]; then
    export GIT_AUTHOR_NAME="$CORRECT_NAME"
    export GIT_AUTHOR_EMAIL="$CORRECT_EMAIL"
fi
' --tag-name-filter cat -- --branches --tags

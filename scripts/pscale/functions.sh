echo Using pscale CLI from latest docker image ...
mkdir -p $HOME/.config/planetscale

function pscale {
    local tty="-t"
    local non_interactive=""
    local command=""

    # if first arg equals shell, and we are getting input piped in we have to turn off pseudo-tty and set PSCALE_ALLOW_NONINTERACTIVE_SHELL=true
    if [ "$1" = "shell" ] &&  ! [[ -t 0 ]]; then
        tty=""
        non_interactive="-e PSCALE_ALLOW_NONINTERACTIVE_SHELL=true"
    fi

    # if script is run in CI and it is not the auth command, we have to turn off pseudo-tty
    if [ -n "$CI" ] && [ "$1" != "auth" ]; then
        tty=""
    fi

    # if NO_DOCKER is set, we will use the locally installed version of pscale
    if [ -n "$NO_DOCKER" ]; then
        command="`which pscale` $@"
    else
        # For debugging, set PSCALE_VERSION to a version of your choice. It defaults to "latest".
        command="docker run -e PLANETSCALE_SERVICE_TOKEN=${PLANETSCALE_SERVICE_TOKEN:-""} -e PLANETSCALE_SERVICE_TOKEN_ID=$PLANETSCALE_SERVICE_TOKEN_ID -e PLANETSCALE_SERVICE_TOKEN_NAME=$PLANETSCALE_SERVICE_TOKEN_NAME -e HOME=/tmp -v $HOME/.config/planetscale:/tmp/.config/planetscale -e PSCALE_ALLOW_NONINTERACTIVE_SHELL=true --user $(id -u):$(id -g) --rm -i $tty planetscale/pscale:${PSCALE_VERSION:-"latest"} $@"
    fi

    # if command is auth and we are running in CI, we will use the script command to get a fake terminal
    if [ "$1" = "auth" ] && [ -n "$CI" ]; then
        echo "::notice ::Please visit the URL displayed in the line below in your browser to authenticate"
        command="script -q -f --return -c '$command' | perl -ne '\$| = 1; \$/ = \"\r\"; \$counter=0; while (<>) { \$url = \$1 if /(http.*)$/; print \"Please click on \" . \$url . \"\n\" if \$url && (\$counter++)%100==0; }'"
        eval $command
    else
        $command
    fi

}

function wait_for_branch_readiness {
    local retries=$1
    local db=$2
    local branch=${3,,}
    local org=$4

    # check whether fifth parameter is set, otherwise use default value
    if [ -z "$5" ]; then
        local max_timeout=60
    else
        local max_timeout=$5
    fi

    local count=0
    local wait=1

    echo "Checking if branch $branch is ready for use..."
    while true; do
        local raw_output=`pscale branch list $db --org $org --format json`
        # check return code, if not 0 then error
        if [ $? -ne 0 ]; then
            echo "Error: pscale branch list returned non-zero exit code $?: $raw_output"
            return 1
        fi
        local output=`echo $raw_output | jq ".[] | select(.name == \"$branch\") | .ready"`
        # test whether output is false, if so, increase wait timeout exponentially
        if [ "$output" == "false" ]; then
            # increase wait variable exponentially but only if it is less than max_timeout
            if [ $((wait * 2)) -le $max_timeout ]; then
                wait=$((wait * 2))
            else
                wait=$max_timeout
            fi

            count=$((count+1))
            if [ $count -ge $retries ]; then
                echo "Branch $branch is not ready after $retries retries. Exiting..."
                return 2
            fi
            echo "Branch $branch is not ready yet. Retrying in $wait seconds..."
            sleep $wait
        elif [ "$output" == "true" ]; then
            echo "Branch $branch is ready for use."
            return 0
        else
            echo "Branch $branch in unknown status: $raw_output"
            return 3
        fi
    done
}
var allIssues = []

loadIssues()

function loadIssues() {

    document.getElementById("spinner").style.display = "block"
    document.getElementById("cardsContainer").innerHTML = ""

    fetch("https://phi-lab-server.vercel.app/api/v1/lab/issues")
    .then(function(res) {
        return res.json()
    })
    .then(function(data) {

        document.getElementById("spinner").style.display = "none"

        allIssues = data.data

        var openCount = 0
        var closedCount = 0

        for (var i = 0; i < allIssues.length; i++) {
            if (allIssues[i].status == "open") {
                openCount++
            }
        }

        closedCount = allIssues.length - openCount

        document.getElementById("countAll").innerText = allIssues.length
        document.getElementById("countOpen").innerText = openCount
        document.getElementById("countClosed").innerText = closedCount
        document.getElementById("openTotal").innerText = openCount
        document.getElementById("closedTotal").innerText = closedCount

        displayCards(allIssues)

    })
    .catch(function(err) {
        document.getElementById("spinner").style.display = "none"
        document.getElementById("cardsContainer").innerHTML = "<p class='text-danger'>Error loading data!</p>"
        console.log(err)
    })

}


function displayCards(issueList) {

    var container = document.getElementById("cardsContainer")
    container.innerHTML = ""

    if (issueList.length == 0) {
        container.innerHTML = "<p class='text-muted text-center mt-3'>No issues to show.</p>"
        return
    }

    for (var i = 0; i < issueList.length; i++) {

        var issue = issueList[i]

        var cardClass = ""
        var statusBadge = ""

        if (issue.status == "open") {
            cardClass = "open-card"
            statusBadge = "<span class='open-badge'>Open</span>"
        } else {
            cardClass = "closed-card"
            statusBadge = "<span class='closed-badge'>Closed</span>"
        }

        var description = "No description."
        if (issue.description) {
            description = issue.description
        }

        var authorName = "Unknown"
        if (issue.author) {
            authorName = issue.author
        }

        var labelsHTML = ""
        if (issue.labels && issue.labels.length > 0) {
            for (var j = 0; j < issue.labels.length; j++) {
                labelsHTML = labelsHTML + "<span class='label-pill'>" + issue.labels[j] + "</span> "
            }
        } else {
            labelsHTML = "<span class='card-info'>None</span>"
        }

        var priorityHTML = ""
        if (issue.priority) {
            priorityHTML = "<span class='priority-pill priority-" + issue.priority + "'>" + issue.priority + "</span>"
        }

        var createdDate = formatDate(issue.createdAt)

        var category = "General"
        if (issue.category) {
            category = issue.category
        }

        var issueId = issue.id

        var cardHTML = "<div class='col-lg-3 col-md-4 col-sm-6 mb-4'>"
        cardHTML += "<div class='issue-card " + cardClass + "' onclick='openModal(" + issueId + ")'>"
        cardHTML += "<div class='d-flex justify-content-between align-items-start mb-2'>"
        cardHTML += "<span class='card-info'>#" + issueId + "</span>"
        cardHTML += priorityHTML
        cardHTML += "</div>"
        cardHTML += "<h6>" + issue.title + "</h6>"
        cardHTML += "<p class='card-description'>" + description + "</p>"
        cardHTML += "<div class='mb-2'>" + labelsHTML + "</div>"
        cardHTML += "<div class='mb-1'>" + statusBadge + "</div>"
        cardHTML += "<p class='card-info'>📁 " + category + "</p>"
        cardHTML += "<p class='card-info'>👤 " + authorName + "</p>"
        cardHTML += "<p class='card-info'>📅 " + createdDate + "</p>"
        cardHTML += "</div>"
        cardHTML += "</div>"

        container.innerHTML = container.innerHTML + cardHTML

    }

}


function showTab(tabName) {

    // reset all buttons first
    document.getElementById("btnAll").className = "btn btn-outline-success me-1"
    document.getElementById("btnOpen").className = "btn btn-outline-success me-1"
    document.getElementById("btnClosed").className = "btn btn-outline-secondary"

    if (tabName == "all") {
        document.getElementById("btnAll").className = "btn btn-success me-1"
        displayCards(allIssues)

    } else if (tabName == "open") {
        document.getElementById("btnOpen").className = "btn btn-success me-1"

        var openList = []

        for (var i = 0; i < allIssues.length; i++) {
            if (allIssues[i].status == "open") {
                openList.push(allIssues[i])
            }
        }

        displayCards(openList)

    } else if (tabName == "closed") {
        document.getElementById("btnClosed").className = "btn btn-secondary"

        var closedList = []

        for (var i = 0; i < allIssues.length; i++) {
            if (allIssues[i].status == "closed") {
                closedList.push(allIssues[i])
            }
        }

        displayCards(closedList)
    }

}


function searchIssues() {

    var searchText = document.getElementById("searchInput").value

    if (searchText == "") {
        displayCards(allIssues)
        return
    }

    document.getElementById("spinner").style.display = "block"
    document.getElementById("cardsContainer").innerHTML = ""

    var url = "https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=" + searchText

    fetch(url)
    .then(function(res) {
        return res.json()
    })
    .then(function(data) {
        document.getElementById("spinner").style.display = "none"

        var results = []
        if (data.data) {
            results = data.data
        }

        displayCards(results)
    })
    .catch(function(err) {
        document.getElementById("spinner").style.display = "none"
        console.log("search error", err)
    })

}


function openModal(issueId) {

    document.getElementById("modalHeading").innerText = "Loading..."
    document.getElementById("modalContent").innerHTML = "<div class='text-center'><div class='spinner-border'></div></div>"

    var modal = new bootstrap.Modal(document.getElementById("detailModal"))
    modal.show()

    fetch("https://phi-lab-server.vercel.app/api/v1/lab/issue/" + issueId)
    .then(function(res) {
        return res.json()
    })
    .then(function(data) {

        var issue = data.data
        if (!issue) {
            issue = data
        }

        var allLabels = "None"
        if (issue.labels && issue.labels.length > 0) {
            allLabels = ""
            for (var i = 0; i < issue.labels.length; i++) {
                allLabels = allLabels + "<span class='label-pill'>" + issue.labels[i] + "</span> "
            }
        }

        var statusBadge = ""
        if (issue.status == "open") {
            statusBadge = "<span class='open-badge'>Open</span>"
        } else {
            statusBadge = "<span class='closed-badge'>Closed</span>"
        }

        var priority = "N/A"
        if (issue.priority) {
            priority = issue.priority
        }

        var category = "N/A"
        if (issue.category) {
            category = issue.category
        }

        var author = "Unknown"
        if (issue.author) {
            author = issue.author
        }

        var assignee = "None"
        if (issue.assignee) {
            assignee = issue.assignee
        }

        var desc = "No description available."
        if (issue.description) {
            desc = issue.description
        }

        document.getElementById("modalHeading").innerText = issue.title

        var html = ""
        html += "<p class='detail-label'>Description</p>"
        html += "<p class='detail-value'>" + desc + "</p>"
        html += "<div class='row'>"

        html += "<div class='col-md-6'>"
        html += "<p class='detail-label'>Status</p>"
        html += "<p class='detail-value'>" + statusBadge + "</p>"
        html += "</div>"

        html += "<div class='col-md-6'>"
        html += "<p class='detail-label'>Category</p>"
        html += "<p class='detail-value'>" + category + "</p>"
        html += "</div>"

        html += "<div class='col-md-6'>"
        html += "<p class='detail-label'>Author</p>"
        html += "<p class='detail-value'>" + author + "</p>"
        html += "</div>"

        html += "<div class='col-md-6'>"
        html += "<p class='detail-label'>Priority</p>"
        html += "<p class='detail-value'>" + priority + "</p>"
        html += "</div>"

        html += "<div class='col-md-6'>"
        html += "<p class='detail-label'>Labels</p>"
        html += "<p class='detail-value'>" + allLabels + "</p>"
        html += "</div>"

        html += "<div class='col-md-6'>"
        html += "<p class='detail-label'>Created At</p>"
        html += "<p class='detail-value'>" + formatDate(issue.createdAt) + "</p>"
        html += "</div>"

        html += "<div class='col-md-6'>"
        html += "<p class='detail-label'>Updated At</p>"
        html += "<p class='detail-value'>" + formatDate(issue.updatedAt) + "</p>"
        html += "</div>"

        html += "<div class='col-md-6'>"
        html += "<p class='detail-label'>Assignee</p>"
        html += "<p class='detail-value'>" + assignee + "</p>"
        html += "</div>"

        html += "</div>"

        document.getElementById("modalContent").innerHTML = html

    })
    .catch(function(err) {
        document.getElementById("modalContent").innerHTML = "<p class='text-danger'>Could not load issue details.</p>"
        console.log(err)
    })

}


function formatDate(dateString) {
    if (!dateString) {
        return "N/A"
    }
    var d = new Date(dateString)
    return d.toDateString()
}


function logOut() {
    localStorage.removeItem("loggedIn")
    window.location.href = "index.html"
}


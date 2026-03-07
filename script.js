// this variable will store all issues
let allIssues = []

// load issues when page opens
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

        // API wraps array inside "data" key
        allIssues = data.data

        // count open and closed using "status" field
        let openCount = 0
        let closedCount = 0

        for (let i = 0; i < allIssues.length; i++) {
            if (allIssues[i].status == "open") {
                openCount = openCount + 1
            } else {
                closedCount = closedCount + 1
            }
        }

        document.getElementById("countAll").innerText = allIssues.length
        document.getElementById("countOpen").innerText = openCount
        document.getElementById("countClosed").innerText = closedCount
        document.getElementById("openTotal").innerText = openCount
        document.getElementById("closedTotal").innerText = closedCount

        displayCards(allIssues)

    })
    .catch(function(error) {
        document.getElementById("spinner").style.display = "none"
        document.getElementById("cardsContainer").innerHTML = "<p class='text-danger'>Error loading data!</p>"
        console.log("Fetch error:", error)
    })

}


function displayCards(issueList) {

    let container = document.getElementById("cardsContainer")
    container.innerHTML = ""

    if (issueList.length == 0) {
        container.innerHTML = "<p class='text-muted text-center mt-3'>No issues to show.</p>"
        return
    }

    for (let i = 0; i < issueList.length; i++) {

        let issue = issueList[i]

        // card border color and status badge
        let cardClass = ""
        let statusBadge = ""

        if (issue.status == "open") {
            cardClass = "open-card"
            statusBadge = "<span class='open-badge'>Open</span>"
        } else {
            cardClass = "closed-card"
            statusBadge = "<span class='closed-badge'>Closed</span>"
        }

        // description - API uses "description"
        let description = issue.description || "No description."

        // author - API has "author" as plain string
        let authorName = issue.author || "Unknown"

        // ALL labels as separate pills
        // API labels is array of strings like ["bug", "help wanted"]
        let labelsHTML = ""
        if (issue.labels && issue.labels.length > 0) {
            for (let j = 0; j < issue.labels.length; j++) {
                labelsHTML = labelsHTML + "<span class='label-pill'>" + issue.labels[j] + "</span> "
            }
        } else {
            labelsHTML = "<span class='card-info'>None</span>"
        }

        // priority badge
        let priorityHTML = ""
        if (issue.priority) {
            priorityHTML = "<span class='priority-pill priority-" + issue.priority + "'>" + issue.priority + "</span>"
        }

        // date - API uses "createdAt"
        let createdDate = formatDate(issue.createdAt)

        // category
        let category = issue.category || "General"

        // issue id
        let issueId = issue.id

        let cardHTML = `
            <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                <div class="issue-card ${cardClass}" onclick="openModal(${issueId})">

                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <span class="card-info">#${issueId}</span>
                        ${priorityHTML}
                    </div>

                    <h6>${issue.title}</h6>
                    <p class="card-description">${description}</p>

                    <div class="mb-2">${labelsHTML}</div>

                    <div class="mb-1">${statusBadge}</div>

                    <p class="card-info">📁 ${category}</p>
                    <p class="card-info">👤 ${authorName}</p>
                    <p class="card-info">📅 ${createdDate}</p>

                </div>
            </div>
        `

        container.innerHTML = container.innerHTML + cardHTML

    }

}


function showTab(tabName) {

    document.getElementById("btnAll").className = "btn btn-outline-success me-1"
    document.getElementById("btnOpen").className = "btn btn-outline-success me-1"
    document.getElementById("btnClosed").className = "btn btn-outline-secondary"

    if (tabName == "all") {
        document.getElementById("btnAll").className = "btn btn-success me-1"
        displayCards(allIssues)

    } else if (tabName == "open") {
        document.getElementById("btnOpen").className = "btn btn-success me-1"

        let openList = []
        for (let i = 0; i < allIssues.length; i++) {
            if (allIssues[i].status == "open") {
                openList.push(allIssues[i])
            }
        }
        displayCards(openList)

    } else if (tabName == "closed") {
        document.getElementById("btnClosed").className = "btn btn-secondary"

        let closedList = []
        for (let i = 0; i < allIssues.length; i++) {
            if (allIssues[i].status == "closed") {
                closedList.push(allIssues[i])
            }
        }
        displayCards(closedList)
    }

}


function searchIssues() {

    let searchText = document.getElementById("searchInput").value

    if (searchText == "") {
        displayCards(allIssues)
        return
    }

    document.getElementById("spinner").style.display = "block"
    document.getElementById("cardsContainer").innerHTML = ""

    fetch("https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=" + searchText)
    .then(function(res) {
        return res.json()
    })
    .then(function(data) {
        document.getElementById("spinner").style.display = "none"
        let results = data.data || []
        displayCards(results)
    })
    .catch(function(error) {
        document.getElementById("spinner").style.display = "none"
        console.log("search error", error)
    })

}


function openModal(issueId) {

    document.getElementById("modalHeading").innerText = "Loading..."
    document.getElementById("modalContent").innerHTML = "<div class='text-center'><div class='spinner-border'></div></div>"

    let modal = new bootstrap.Modal(document.getElementById("detailModal"))
    modal.show()

    fetch("https://phi-lab-server.vercel.app/api/v1/lab/issue/" + issueId)
    .then(function(res) {
        return res.json()
    })
    .then(function(data) {

        let issue = data.data || data

        // build all labels
        let allLabels = "None"
        if (issue.labels && issue.labels.length > 0) {
            allLabels = ""
            for (let i = 0; i < issue.labels.length; i++) {
                allLabels = allLabels + "<span class='label-pill'>" + issue.labels[i] + "</span> "
            }
        }

        let statusBadge = ""
        if (issue.status == "open") {
            statusBadge = "<span class='open-badge'>Open</span>"
        } else {
            statusBadge = "<span class='closed-badge'>Closed</span>"
        }

        document.getElementById("modalHeading").innerText = issue.title

        document.getElementById("modalContent").innerHTML = `
            <p class="detail-label">Description</p>
            <p class="detail-value">${issue.description || "No description available."}</p>

            <div class="row">
                <div class="col-md-6">
                    <p class="detail-label">Status</p>
                    <p class="detail-value">${statusBadge}</p>
                </div>
                <div class="col-md-6">
                    <p class="detail-label">Category</p>
                    <p class="detail-value">${issue.category || "N/A"}</p>
                </div>
                <div class="col-md-6">
                    <p class="detail-label">Author</p>
                    <p class="detail-value">${issue.author || "Unknown"}</p>
                </div>
                <div class="col-md-6">
                    <p class="detail-label">Priority</p>
                    <p class="detail-value">${issue.priority || "N/A"}</p>
                </div>
                <div class="col-md-6">
                    <p class="detail-label">Labels</p>
                    <p class="detail-value">${allLabels}</p>
                </div>
                <div class="col-md-6">
                    <p class="detail-label">Created At</p>
                    <p class="detail-value">${formatDate(issue.createdAt)}</p>
                </div>
            </div>
        `

    })
    .catch(function(error) {
        document.getElementById("modalContent").innerHTML = "<p class='text-danger'>Could not load issue details.</p>"
        console.log(error)
    })

}


function formatDate(dateString) {
    if (!dateString) return "N/A"
    let d = new Date(dateString)
    return d.toDateString()
}


function logOut() {
    localStorage.removeItem("loggedIn")
    window.location.href = "index.html"
}


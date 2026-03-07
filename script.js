// this variable will store all issues we get from api
let allIssues = []

// load issues as soon as page is ready
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

        // API might return the array directly, OR wrapped inside a key
        // so we check all possible formats here
        if (Array.isArray(data)) {
            allIssues = data
        } else if (data.issues && Array.isArray(data.issues)) {
            allIssues = data.issues
        } else if (data.data && Array.isArray(data.data)) {
            allIssues = data.data
        } else {
            // last resort - try to grab whatever array is inside
            let keys = Object.keys(data)
            for (let i = 0; i < keys.length; i++) {
                if (Array.isArray(data[keys[i]])) {
                    allIssues = data[keys[i]]
                    break
                }
            }
        }

        console.log("Total issues loaded:", allIssues.length)
        document.getElementById("cardsContainer").innerHTML = "<pre>" + JSON.stringify(allIssues[0], null, 2) + "</pre>"

        // count open and closed
        let openCount = 0
        let closedCount = 0

        for (let i = 0; i < allIssues.length; i++) {
            if (allIssues[i].state == "open") {
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
        document.getElementById("cardsContainer").innerHTML = "<p class='text-danger'>Error loading data! Check your internet connection.</p>"
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

        let cardClass = ""
        let badgeHTML = ""

        if (issue.state == "open") {
            cardClass = "open-card"
            badgeHTML = "<span class='open-badge'>Open</span>"
        } else {
            cardClass = "closed-card"
            badgeHTML = "<span class='closed-badge'>Closed</span>"
        }

        let description = "No description."
        if (issue.body) {
            description = issue.body
        }

        let authorName = "Unknown"
        if (issue.user && issue.user.login) {
            authorName = issue.user.login
        }

        let labelName = "None"
        if (issue.labels && issue.labels.length > 0) {
            labelName = issue.labels[0].name
        }

        let category = "General"
        if (issue.category) {
            category = issue.category
        }

        // use number if exists, otherwise id
        let issueId = issue.number || issue.id || issue._id || i

        let createdDate = formatDate(issue.created_at)

        let cardHTML = `
            <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                <div class="issue-card ${cardClass}" onclick="openModal(${issueId})">
                    <h6>${issue.title}</h6>
                    <p class="card-description">${description}</p>
                    <div class="mb-2">${badgeHTML}</div>
                    <p class="card-info">📁 Category: ${category}</p>
                    <p class="card-info">👤 Author: ${authorName}</p>
                    <p class="card-info">🏷️ Label: ${labelName}</p>
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
            if (allIssues[i].state == "open") {
                openList.push(allIssues[i])
            }
        }
        displayCards(openList)

    } else if (tabName == "closed") {
        document.getElementById("btnClosed").className = "btn btn-secondary"

        let closedList = []
        for (let i = 0; i < allIssues.length; i++) {
            if (allIssues[i].state == "closed") {
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

        // same fix - handle wrapped response
        let results = []
        if (Array.isArray(data)) {
            results = data
        } else if (data.issues && Array.isArray(data.issues)) {
            results = data.issues
        } else if (data.data && Array.isArray(data.data)) {
            results = data.data
        }

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

        // single issue might also be wrapped
        let issue = data
        if (data.issue) {
            issue = data.issue
        } else if (data.data) {
            issue = data.data
        }

        let author = "Unknown"
        if (issue.user && issue.user.login) {
            author = issue.user.login
        }

        let labels = "None"
        if (issue.labels && issue.labels.length > 0) {
            labels = ""
            for (let i = 0; i < issue.labels.length; i++) {
                labels = labels + issue.labels[i].name + " "
            }
        }

        let statusBadge = ""
        if (issue.state == "open") {
            statusBadge = "<span class='open-badge'>Open</span>"
        } else {
            statusBadge = "<span class='closed-badge'>Closed</span>"
        }

        document.getElementById("modalHeading").innerText = issue.title

        document.getElementById("modalContent").innerHTML = `
            <p class="detail-label">Description</p>
            <p class="detail-value">${issue.body || "No description available."}</p>

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
                    <p class="detail-value">${author}</p>
                </div>
                <div class="col-md-6">
                    <p class="detail-label">Priority</p>
                    <p class="detail-value">${issue.priority || "N/A"}</p>
                </div>
                <div class="col-md-6">
                    <p class="detail-label">Labels</p>
                    <p class="detail-value">${labels}</p>
                </div>
                <div class="col-md-6">
                    <p class="detail-label">Created At</p>
                    <p class="detail-value">${formatDate(issue.created_at)}</p>
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
    if (!dateString) {
        return "N/A"
    }
    let d = new Date(dateString)
    return d.toDateString()
}


function logOut() {
    localStorage.removeItem("loggedIn")
    window.location.href = "index.html"
}

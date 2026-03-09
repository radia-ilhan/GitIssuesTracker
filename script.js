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

		// count open and closed separately
		var openCount = 0
		var closedCount = 0
		var i = 0

		while (i < allIssues.length) {
			if (allIssues[i].status == "open") {
				openCount = openCount + 1
			} else {
				closedCount = closedCount + 1
			}
			i++
		}

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

	var i = 0

	while (i < issueList.length) {

		var issue = issueList[i]

		// check status and pick the right class and badge
		var cardClass = ""
		var statusBadge = ""

		if (issue.status == "open") {
			cardClass = "open-card"
			statusBadge = "<span class='open-badge'>Open</span>"
		}
		if (issue.status == "closed") {
			cardClass = "closed-card"
			statusBadge = "<span class='closed-badge'>Closed</span>"
		}

		// description
		var description = "No description."
		if (issue.description != null && issue.description != "") {
			description = issue.description
		}

		// author
		var authorName = "Unknown"
		if (issue.author != null && issue.author != "") {
			authorName = issue.author
		}

		// labels - loop through them if any
		var labelsHTML = ""
		if (issue.labels != null && issue.labels.length > 0) {
			var j = 0
			while (j < issue.labels.length) {
				labelsHTML = labelsHTML + "<span class='label-pill'>" + issue.labels[j] + "</span> "
				j++
			}
		} else {
			labelsHTML = "<span class='card-info'>None</span>"
		}

		// priority badge
		var priorityHTML = ""
		if (issue.priority != null && issue.priority != "") {
			priorityHTML = "<span class='priority-pill priority-" + issue.priority + "'>" + issue.priority + "</span>"
		}

		var createdDate = formatDate(issue.createdAt)

		// category
		var category = "General"
		if (issue.category != null && issue.category != "") {
			category = issue.category
		}

		var issueId = issue.id

		// build the card html piece by piece
		var cardHTML = ""
		cardHTML = cardHTML + "<div class='col-lg-3 col-md-4 col-sm-6 mb-4'>"
		cardHTML = cardHTML + "<div class='issue-card " + cardClass + "' onclick='openModal(" + issueId + ")'>"
		cardHTML = cardHTML + "<div class='d-flex justify-content-between align-items-start mb-2'>"
		cardHTML = cardHTML + "<span class='card-info'>#" + issueId + "</span>"
		cardHTML = cardHTML + priorityHTML
		cardHTML = cardHTML + "</div>"
		cardHTML = cardHTML + "<h6>" + issue.title + "</h6>"
		cardHTML = cardHTML + "<p class='card-description'>" + description + "</p>"
		cardHTML = cardHTML + "<div class='mb-2'>" + labelsHTML + "</div>"
		cardHTML = cardHTML + "<div class='mb-1'>" + statusBadge + "</div>"
		cardHTML = cardHTML + "<p class='card-info'>" + category + "</p>"
		cardHTML = cardHTML + "<p class='card-info'>" + authorName + "</p>"
		cardHTML = cardHTML + "<p class='card-info'>" + createdDate + "</p>"
		cardHTML = cardHTML + "</div>"
		cardHTML = cardHTML + "</div>"

		container.innerHTML = container.innerHTML + cardHTML

		i++
	}

}


function showTab(tabName) {

	// reset button styles first
	document.getElementById("btnAll").className = "btn btn-outline-success me-1"
	document.getElementById("btnOpen").className = "btn btn-outline-success me-1"
	document.getElementById("btnClosed").className = "btn btn-outline-secondary"

	if (tabName == "all") {

		document.getElementById("btnAll").className = "btn btn-success me-1"
		displayCards(allIssues)

	} else if (tabName == "open") {

		document.getElementById("btnOpen").className = "btn btn-success me-1"

		var openList = []
		var i = 0

		while (i < allIssues.length) {
			if (allIssues[i].status == "open") {
				openList.push(allIssues[i])
			}
			i++
		}

		displayCards(openList)

	} else if (tabName == "closed") {

		document.getElementById("btnClosed").className = "btn btn-secondary"

		var closedList = []
		var i = 0

		while (i < allIssues.length) {
			if (allIssues[i].status == "closed") {
				closedList.push(allIssues[i])
			}
			i++
		}

		displayCards(closedList)

	}

}


function searchIssues() {

	var searchText = document.getElementById("searchInput").value

	// if search is empty just show everything again
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

		// labels
		var labelsHTML = ""
		if (issue.labels != null && issue.labels.length > 0) {
			var i = 0
			while (i < issue.labels.length) {
				labelsHTML = labelsHTML + "<span class='label-pill modal-label-pill'>🐛 " + issue.labels[i] + "</span> "
				i++
			}
		} else {
			labelsHTML = "<span class='text-muted'>None</span>"
		}

		// status badge
		var statusBadge = ""
		if (issue.status == "open") {
			statusBadge = "<span class='modal-open-badge'>opened</span>"
		}
		if (issue.status == "closed") {
			statusBadge = "<span class='modal-closed-badge'>closed</span>"
		}

		var priority = "N/A"
		if (issue.priority != null && issue.priority != "") {
			priority = issue.priority
		}

		var category = "N/A"
		if (issue.category != null && issue.category != "") {
			category = issue.category
		}

		var author = "Unknown"
		if (issue.author != null && issue.author != "") {
			author = issue.author
		}

		var assignee = "N/A"
		if (issue.assignee != null && issue.assignee != "") {
			assignee = issue.assignee
		}

		var desc = "No description available."
		if (issue.description != null && issue.description != "") {
			desc = issue.description
		}

		document.getElementById("modalHeading").innerText = issue.title

		// build modal content to match the design
		var html = ""

		// top row: status badge + opened by info
		html = html + "<div class='modal-top-row'>"
		html = html + statusBadge
		html = html + "<span class='modal-opened-info'>• Opened by " + author + " • " + formatDate(issue.createdAt) + "</span>"
		html = html + "</div>"

		// labels row
		html = html + "<div class='modal-labels-row'>"
		html = html + labelsHTML
		html = html + "</div>"

		// description
		html = html + "<p class='modal-desc'>" + desc + "</p>"

		// bottom info box - assignee and priority side by side
		html = html + "<div class='modal-info-box'>"

		html = html + "<div class='modal-info-item'>"
		html = html + "<span class='modal-info-label'>Assignee:</span>"
		html = html + "<p class='modal-info-value'>" + assignee + "</p>"
		html = html + "</div>"

		html = html + "<div class='modal-info-item'>"
		html = html + "<span class='modal-info-label'>Priority:</span>"
		html = html + "<p><span class='priority-pill priority-" + priority + "'>" + priority + "</span></p>"
		html = html + "</div>"

		html = html + "</div>"

		// extra info below box
		html = html + "<div class='modal-extra-info'>"
		html = html + "<span>📁 " + category + "</span>"
		html = html + "<span>Updated: " + formatDate(issue.updatedAt) + "</span>"
		html = html + "</div>"

		document.getElementById("modalContent").innerHTML = html

	})
	.catch(function(err) {
		document.getElementById("modalContent").innerHTML = "<p class='text-danger'>Could not load issue details.</p>"
		console.log(err)
	})

}


function formatDate(dateString) {
	if (dateString == null || dateString == "") {
		return "N/A"
	}
	var d = new Date(dateString)
	return d.toLocaleDateString()
}


function logOut() {
	localStorage.removeItem("loggedIn")
	window.location.href = "index.html"
}

var allIssues = []

//page load hoile issues anbo
loadIssues()

function loadIssues() {

    //spinner show 
    document.getElementById("spinner").style.display = "block"

    //aage cards clear 
    document.getElementById("cardsContainer").innerHTML = ""

    //api theke issues 
    fetch("https://phi-lab-server.vercel.app/api/v1/lab/issues")
    .then(function(res) {
        return res.json()
    })
    .then(function(data) {

        //data ashle spinner band 
        document.getElementById("spinner").style.display = "none"

        
        allIssues = data.data

        
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

        //count gulo html e dekhabo
        document.getElementById("countAll").innerText = allIssues.length
        document.getElementById("countOpen").innerText = openCount

        document.getElementById("countClosed").innerText = closedCount

        document.getElementById("openTotal").innerText = openCount

        document.getElementById("closedTotal").innerText = closedCount

        
        displayCards(allIssues)

    })
    .catch(function(err) {

        //error hoile spinner band r message dekhabo

        document.getElementById("spinner").style.display = "none"

        document.getElementById("cardsContainer").innerHTML = "<p class='text-danger'>Error loading data!</p>"
        console.log(err)
    })

}


function displayCards(issueList) {

    //container ta nibo
    var box = document.getElementById("cardsContainer")

    //age purano cards clear
    box.innerHTML = ""

    //kono issue na thakle message dekhai
    if (issueList.length == 0) {

        box.innerHTML = "<p class='text-muted text-center mt-3'>No issues to show.</p>"
        return
    }

    var i = 0

    while (i < issueList.length) {

        var issue = issueList[i]

        //status check kore class r badge thik korbo
        var cc = ""
        var sb = ""

        if (issue.status == "open") {
            cc = "open-card"

            sb = "<span class='open-badge'>Open</span>"

        }
        if (issue.status == "closed") {
            cc = "closed-card"
            sb = "<span class='closed-badge'>Closed</span>"
        }

        
        var desc = "No description."
        if (issue.description) {
            desc = issue.description
        }

        //author nibo
        var auth = "Unknown"

        if (issue.author) {

            auth = issue.author
        }

        //labels loop 
        var lhtml = ""

        if (issue.labels) {
            var j = 0

            while (j < issue.labels.length) {

                lhtml = lhtml + "<span class='label-pill'>" + issue.labels[j] + "</span> "
                
                j++
            }
        } else {
            lhtml = "<span class='card-info'>None</span>"
        }

    
        var phtml = ""
        if (issue.priority) {
            
            
            phtml = "<span class='priority-pill priority-" + issue.priority + "'>" + issue.priority + "</span>"
        }

        //date format kori
        var cdate = formatDate(issue.createdAt)

        //category nibo
        
        
        var cat = "General"
        if (issue.category) {
            
            cat = issue.category
        }

        var id = issue.id

        //card 
        var card = ""
        card = card + "<div class='col-lg-3 col-md-4 col-sm-6 mb-4'>"
        card = card + "<div class='issue-card " + cc + "' onclick='openModal(" + id + ")'>"
        
        card = card + "<div class='d-flex justify-content-between align-items-start mb-2'>"
        
        card = card + "<span class='card-info'>#" + id + "</span>"
        card = card + phtml
        card = card + "</div>"
        
        card = card + "<h6>" + issue.title + "</h6>"
        
        card = card + "<p class='card-description'>" + desc + "</p>"
        
        
        card = card + "<div class='mb-2'>" + lhtml + "</div>"
        card = card + "<div class='mb-1'>" + sb + "</div>"
        card = card + "<p class='card-info'>" + cat + "</p>"
        card = card + "<p class='card-info'>" + auth + "</p>"
        
        card = card + "<p class='card-info'>" + cdate + "</p>"
        card = card + "</div>"

        card = card + "</div>"

        //container e add 
        box.innerHTML = box.innerHTML + card

        i++
    }

}


function showTab(tabName) {

    //age sob button reset 
    document.getElementById("btnAll").className = "btn btn-outline-success me-1"
    
    document.getElementById("btnOpen").className = "btn btn-outline-success me-1"
    document.getElementById("btnClosed").className = "btn btn-outline-secondary"

    if (tabName == "all") {

        //all button active korbo
        
        document.getElementById("btnAll").className = "btn btn-success me-1"
        
        displayCards(allIssues)

    } else if (tabName == "open") {

        //open button active korbo
        document.getElementById("btnOpen").className = "btn btn-success me-1"

        //open issues filter korbo
        
        var oList = []
        var i = 0

        while (i < allIssues.length) {
            
            if (allIssues[i].status == "open") {
                
                oList.push(allIssues[i])
            
            }
            i++
        }

        displayCards(oList)

    } else if (tabName == "closed") {

        //closed button active korbo
        
        document.getElementById("btnClosed").className = "btn btn-secondary"

        //closed issues filter korbo
        var cList = []
        
        var i = 0

        while (i < allIssues.length) {
            
            if (allIssues[i].status == "closed") {
                
                cList.push(allIssues[i])
            }
            i++

        }

        displayCards(cList)

    }

}


function searchIssues() {

    //search input theke text nibo
    var txt = document.getElementById("searchInput").value

    //empty hole sob dekhabo
    
    if (txt == "") {
        
        displayCards(allIssues)
        return
    }

    //spinner show kori
    
    document.getElementById("spinner").style.display = "block"
    
    document.getElementById("cardsContainer").innerHTML = ""

    //search api call korbo
    var url = "https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=" + txt

    fetch(url)
    .then(function(res) {
        
        
        return res.json()
    })
    .then(function(data) {

        //spinner band
        document.getElementById("spinner").style.display = "none"

        var res = []

        if (data.data) {
            res = data.data

        }

        
        displayCards(res)

    })
    .catch(function(err) {
        document.getElementById("spinner").style.display = "none"
        console.log("search error", err)
    })

}


function openModal(issueId) {

    //modal open howar age loading dekhabo
    document.getElementById("modalHeading").innerText = "Loading..."
    document.getElementById("modalContent").innerHTML = "<div class='text-center'><div class='spinner-border'></div></div>"

    //modal show korbo
    var m = new bootstrap.Modal(document.getElementById("detailModal"))
    m.show()

    //api theke single issue anbo
    fetch("https://phi-lab-server.vercel.app/api/v1/lab/issue/" + issueId)


    .then(function(res) {
        return res.json()
        
    })
    .then(function(data) {

        var issue = data.data
        if (!issue) {
            issue = data
        }

        //labels banabo
        var lhtml = ""
        if (issue.labels != null && issue.labels.length > 0) {

            var i = 0

            while (i < issue.labels.length) {


                lhtml = lhtml + "<span class='label-pill modal-label-pill'>" + issue.labels[i] + "</span> "
                i++
            }
        } else {
            lhtml = "<span class='text-muted'>None</span>"
        }

        //status badge thik korbo
        var sb = ""
        if (issue.status == "open") {
            sb = "<span class='modal-open-badge'>opened</span>"


        }
        if (issue.status == "closed") {

            sb = "<span class='modal-closed-badge'>closed</span>"
        }

        //priority nibo
        var pri = "N/A"
        if (issue.priority != null && issue.priority != "") {
            pri = issue.priority
        }

        //category nibo
        var cat = "N/A"
        if (issue.category != null && issue.category != "") {
            cat = issue.category
        }

        //author nibo
        var auth = "Unknown"
        if (issue.author != null && issue.author != "") {
            auth = issue.author
        }

        //assignee nibo
        var asgn = "N/A"
        if (issue.assignee != null && issue.assignee != "") {
            asgn = issue.assignee
        }

        //description nibo
        var desc = "No description available."
        if (issue.description != null && issue.description != "") {
            desc = issue.description
        }

        //modal heading set korbo
        document.getElementById("modalHeading").innerText = issue.title

        //modal content banabo
        var html = ""

        //status badge r author dekhabo
        html = html + "<div class='modal-top-row'>"
        html = html + sb
        html = html + "<span class='modal-opened-info'>• Opened by " + auth + " • " + formatDate(issue.createdAt) + "</span>"
        
        html = html + "</div>"

        //labels dekhabo
        html = html + "<div class='modal-labels-row'>"
        
        html = html + lhtml
        html = html + "</div>"

        //description dekhabo
        html = html + "<p class='modal-desc'>" + desc + "</p>"

        //assignee r priority box dekhabo
        html = html + "<div class='modal-info-box'>"

        html = html + "<div class='modal-info-item'>"
        html = html + "<span class='modal-info-label'>Assignee:</span>"
        html = html + "<p class='modal-info-value'>" + asgn + "</p>"
        html = html + "</div>"

        html = html + "<div class='modal-info-item'>"
        html = html + "<span class='modal-info-label'>Priority:</span>"
        
        html = html + "<p><span class='priority-pill priority-" + pri + "'>" + pri + "</span></p>"
        html = html + "</div>"

        html = html + "</div>"

        //category r updated date dekhabo
        html = html + "<div class='modal-extra-info'>"
        
        html = html + "<span>" + cat + "</span>"
        html = html + "<span>Updated: " + formatDate(issue.updatedAt) + "</span>"
        html = html + "</div>"

        document.getElementById("modalContent").innerHTML = html

    })
    .catch(function(err) {
        
        document.getElementById("modalContent").innerHTML = "<p class='text-danger'>Could not load issue details.</p>"
        console.log(err)
    
    })

}


function formatDate(dt) {
    //date na thakle N/A dekhabo
    if (dt == null || dt == "") {
        return "N/A"
    }
    
    var d = new Date(dt)
    
    return d.toLocaleDateString()
}


function logOut() {
   
    //localstorage clear kore login page e pathabo

    localStorage.removeItem("loggedIn")

    window.location.href = "index.html"

}

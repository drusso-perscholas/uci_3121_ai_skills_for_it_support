import { useState } from 'react'
import './home.css'
import * as React from 'react';
function home() {

    interface PostInfo {
        upfp: TexImageSource;
        postid: number;
        posterUID: number;
        postText?: string;
        images?: string;
        likes: string;
        reposts: string;
        likeAmt?: number;
        repostAmt?: number;
        commentAmt?: number;
        datePosted: string;
        originalPostID: number;
    }

    interface UserAccountInterface {
        tokenValidBool: boolean
        username: string
        pfp: string
        profiledesc: string
        followersamt: number
        followingamt: number
        profilebanner: string
    }

    interface ForeignAccountInfo {
        username: string;
        pfp: string;
    }

    interface CommentData {
        commentText: string;
        uid: number;
        commentOnCommentID: number;
        commentID: number;
        comments: CommentData[];
    }

    interface boolReturn {
        returnvalue: boolean;
    }

    let setFilePFP: File;
    let setFileBanner: File;
    const lastDate = new Date();
    let setPostID: number;
    let setCommentOnCommentID: number;

    let nextPostDivID = 0;
    let firstLoad = true;

    const onFileChangePFP = (event) => {
        setFilePFP = event.target.files[0];
    }

    const onFileChangeBanner = (event) => {
        setFileBanner = event.target.files[0];
    }


    const StartScript = async () => {
        await CheckToken();

        if (firstLoad) {
            getHomePosts();
            firstLoad = false;
        }
    }

    async function CheckToken() {
        try {
            const accountToken = localStorage.getItem("sessionid");
            const accountUID = localStorage.getItem("uid");

            if (accountToken === null) {
                window.location.assign("index.html");
            };

            const uidToken = accountUID + ":" + accountToken;
            console.log("Sending Check Token Home");
            const response = await fetch('../api/mimirchecktoken?uidToken=' + uidToken.toString(), {
                method: "POST"
            })
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data = await response.json();
            if (data.check === "false") {
                window.location.assign("index.html");
            }
        }
        catch (err) {
            console.error('Error loggin in:', err)
            window.location.assign("index.html");
        }
    }
    function ClickedHome() {
        const homeDiv = document.getElementById("home");
        homeDiv.style.display = "block";

        const feedsDiv = document.getElementById("feeds");
        feedsDiv.style.display = "none";

        const accountDiv = document.getElementById("account");
        accountDiv.style.display = "none";
        getHomePosts()
    }

    function ClickedFeeds() {
        const homeDiv = document.getElementById("home");
        homeDiv.style.display = "none";

        const feedsDiv = document.getElementById("feeds");
        feedsDiv.style.display = "block";

        const accountDiv = document.getElementById("account");
        accountDiv.style.display = "none";
    }

    const ClickedAccount = async () => {

        const homeDiv = document.getElementById("home");
        homeDiv.style.display = "none";

        const feedsDiv = document.getElementById("feeds");
        feedsDiv.style.display = "none";

        const accountDiv = document.getElementById("account");
        accountDiv.style.display = "block";

        const accountToken = localStorage.getItem("sessionid");
        const accountUID = localStorage.getItem("uid");
        const uidToken = accountUID + ":" + accountToken;
        /* alert("Clicked Account: " + "../api/mimirpostgresgetuseraccount?uidAndToken=" + uidToken.toString()); */
        try {
            const response = await fetch('../api/mimirpostgresgetuseraccount?uidAndToken=' + uidToken.toString(), {
                method: "POST"
            })
            if (!response.ok) {
                alert("Clicked Account Response Fail");
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data: UserAccountInterface[] = await response.json()

            /* Promised array { tokenValidBool, username, pfp, profiledesc, followersamt, followingamt, banner } */
            if (data[0].toString() === "false") {
                window.location.assign("index.html");
            }
            /*alert(data[0] + " " + data[1] + " " + data[2] + " " + data[3] + " " + data[4] + " " + data[5] + " " + data[6]);*/
            const accountpfp = document.getElementById("accountpfp") as HTMLImageElement;
            const accountbanner = document.getElementById("accountbanner") as HTMLImageElement;

            document.getElementById("accountname").textContent = data[1].toString();

            if (data[3].toString() != "") {
                document.getElementById("editaccountdesc").textContent = data[3].toString();
            }

            if (data[2].toString() === "") {
                accountpfp.src = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg";
            }
            else {
                accountpfp.src = data[2].toString();
            }

            if (data[6].toString() === "") {
                accountbanner.src = "/tmpbanner";
            }
            else {
                accountbanner.src = data[6].toString();
            }

            

        }
        catch (err) {
            console.error('Error getting account information in:', err)
        }

    }

    function ClickedForeignAccount() {
        const homeDiv = document.getElementById("home");
        homeDiv.style.display = "none";

        const feedsDiv = document.getElementById("feeds");
        feedsDiv.style.display = "none";

        const accountDiv = document.getElementById("account");
        accountDiv.style.display = "none";
    }

    const SubmitNewPost = async(postText: string, postImage: File) => {

        const content = new FormData();
        content.append("token", localStorage.getItem("sessionid"));
        content.append("uid", localStorage.getItem("uid"));
        content.append("postText", postText);
        content.append("image", postImage);

        try {
            const response = await fetch('../api/mimirnewpost', {
                method: "POST",
                body: content
            })
            if (!response.ok) {
                alert("Clicked Account Response Fail");
                throw new Error(`HTTP error! status: ${response.status}`)
            }
        }
        catch (err) {
            console.error('Error setting description: ', err)
        }
        ClickedAccount();
    }

    const GetForeignAccounts = async (uid: string[]) => {

        let uids: string;
        uids = uid[0].toString();
        for (let i = 1; i < uid.length; i++) {
            uids += ":" + uid[i].toString();
        }
        
        try {
            const response = await fetch('../api/mimirpostgresgetforeignaccount?arguments=' + uids, {
                method: "POST"
            })
            if (!response.ok) {
                alert("Clicked Account Response Fail");
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data: ForeignAccountInfo[] = await response.json()
            return data;
        }
        catch (err) {
            console.error('Error setting description: ', err)
        }
    }

    const EditDescription = async (description: string) => {
        const accountToken = localStorage.getItem("sessionid");
        const accountUID = localStorage.getItem("uid");
        const UIDTokenChangeText = accountUID + ":" + accountToken + ":desc:" + description;
        
        try {
            const response = await fetch('../api/mimirpostgresupdatedesc?UIDTokenChangeText=' + UIDTokenChangeText.toString(), {
                method: "POST"
            })
            if (!response.ok) {
                alert("Clicked Account Response Fail");
                throw new Error(`HTTP error! status: ${response.status}`)
            }
        }
        catch (err) {
            console.error('Error setting description: ', err)
        }
        ClickedAccount();
    }

    const UpdateProfilePicture = async () => {
        const content = new FormData();
        content.append("token", localStorage.getItem("sessionid"));
        content.append("uid", localStorage.getItem("uid"));
        content.append("image", setFilePFP);

        try {
            const response = await fetch('../api/mimirupdatepfp', {
                method: "POST",
                body: content
            })
            if (!response.ok) {
                alert("Clicked Account Response Fail");
                throw new Error(`HTTP error! status: ${response.status}`)
            }
        }
        catch (err) {
            console.error('Error setting description: ', err)
        }
        ClickedAccount();
    }

    const UpdateProfileBanner = async () => {
        const content = new FormData();
        content.append("token", localStorage.getItem("sessionid"));
        content.append("uid", localStorage.getItem("uid"));
        content.append("image", setFileBanner);

        try {
            const response = await fetch('../api/mimirupdatebanner', {
                method: "POST",
                body: content
            })
            if (!response.ok) {
                alert("Clicked Account Response Fail");
                throw new Error(`HTTP error! status: ${response.status}`)
            }
        }
        catch (err) {
            console.error('Error setting description: ', err)
        }
        ClickedAccount();

    }

    function handleAccountButton(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        ClickedAccount();
        removePosts();
        getAccountPosts();
    }

    function handleHomeButton(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        removePosts();
        ClickedHome();
    }

    function handleFeedsButton(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        removePosts();
        ClickedFeeds();
    }

    function handleEditDescriptionButton(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        const editDescField = document.getElementById("editprofiledesc");
        editDescField.style.display = "flex"
    }

    function handleEditPFPButton(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        const editDescField = document.getElementById("editpfp");
        editDescField.style.display = "flex"
    }

    function handleEditBannerButton(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        const editDescField = document.getElementById("editbanner");
        editDescField.style.display = "flex"
    }

    function handleDescInputSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const editprofiledesc = document.getElementById("editprofiledesc");
        editprofiledesc.style.display = "none";
        if (event.currentTarget.desctextarea.value === undefined) { return; }
        EditDescription(event.currentTarget.desctextarea.value);
    }

    function handlePFPImageFileUpload(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        UpdateProfilePicture();
        const editpfp = document.getElementById("editpfp");
        editpfp.style.display = "none";
    }

    function handleProfileBannerImageUpload(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        UpdateProfileBanner();
        const editbanner = document.getElementById("editbanner");
        editbanner.style.display = "none";
    }

    function handleNewPostButton(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        const newPostField = document.getElementById("newposteditor");
        newPostField.style.display = "flex"
        
    }

    function handleNewPostSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const newposteditor = document.getElementById("newposteditor");
        newposteditor.style.display = "none";
        if (event.currentTarget.newposttextarea.value === undefined && event.currentTarget.newpostfile.files[0] === undefined) { return; }
        //console.log(event.currentTarget.newpostfile.files[0]);
        SubmitNewPost(event.currentTarget.newposttextarea.value, event.currentTarget.newpostfile.files[0]);
    }

    function handleGetPostsButton(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        getAccountPosts();
    }

    function handleClickedForeignAccount() {
    }

    function handleClickedLikeButton(postID: string) {
        console.log("Clicked Like Button");
        likePost(postID);
    }
 

    /* Post Functions (reposting, liking, commenting) */

    const likePost = async (postid: string) => {
        const accountToken = localStorage.getItem("sessionid");
        const accountUID = localStorage.getItem("uid");

        const tokenUIDPost = accountToken.toString() + ":" + accountUID.toString() + ":" + postid.toString();

        try {
            const response = await fetch('../api/mimirlikepost?tokenuidpostid=' + tokenUIDPost, {
                method: "POST",
            })
            if (!response.ok) {
                alert("Clicked Account Response Fail");
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            
            const boolJSON: boolReturn = await response.json();
            console.log(boolJSON.returnvalue);
            const postImage: HTMLImageElement = document.getElementById("likeicon" + postid);
            const postText: HTMLHeadingElement = document.getElementById("likeamt" + postid);     

            if (boolJSON.returnvalue) {
                postImage.src = "/icons/likeiconfull.png";
                postText.textContent = (parseInt(postText.textContent) + 1).toString();
            }
            else {
                postImage.src = "/icons/likeicon.png";
                postText.textContent = (parseInt(postText.textContent) - 1).toString();
            }
            
        }
        catch {
            console.warn("Cannot Like Post");
        }
    }

    window.onclick = function (event) {
        const editprofiledesc = document.getElementById("editprofiledesc");
        if (event.target == editprofiledesc) {
            editprofiledesc.style.display = "none";
        }
        const editpfp = document.getElementById("editpfp");
        if (event.target == editpfp) {
            editpfp.style.display = "none";
        }
        const editbanner = document.getElementById("editbanner");
        if (event.target == editbanner) {
            editbanner.style.display = "none";
        }
        const newpost = document.getElementById("newposteditor");
        if (event.target == newpost) {
            newpost.style.display = "none";
        }
        const reply = document.getElementById("reply");
        if (event.target == reply) {
            reply.style.display = "none";
        }
        const addComment = document.getElementById("addcomment");
        if (event.target == addComment) {
            addComment.style.display = "none";
        }
    }

    const getAccountPosts = async () => {
        await removePosts();

        const uidDate = localStorage.getItem("uid") + "|" + lastDate.toISOString();
        console.log(uidDate);
        try {
            const response = await fetch('../api/mimirpostgresgetposts?arguments=' + uidDate.toString(), {
                method: "POST",
            })

            if (!response.ok) {
                alert("Clicked Account Response Fail");
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const postarray: PostInfo[] = await response.json();
            
            appendPosts(postarray);
        }
        catch (err) {
            console.error('Error setting description: ', err)
        }
    }

    const getHomePosts = async () => {
        await removePosts();

        const uidDate = localStorage.getItem("uid") + "|" + lastDate.toISOString();
        console.log(uidDate);
        try {
            const response = await fetch('../api/mimirpostgresgethomeposts?arguments=' + uidDate.toString(), {
                method: "POST",
            })

            if (!response.ok) {
                alert("Clicked Account Response Fail");
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const postarray: PostInfo[] = await response.json();

            appendPosts(postarray);
        }
        catch (err) {
            console.error('Error setting description: ', err)
        }
    }

    const appendPosts = async(posts: PostInfo[]) => {
        console.log("Appending Posts");
        const wantedUIDs = [];
        console.log("Getting Foreign Accounts: " + posts.length.toString());
        for (let i = 0; i < posts.length; i++) {
            console.log (i.toString() + " UID: " +  posts[i].posterUID.toString() + " Post Text: " + posts[i].postText);
            wantedUIDs[i] = (posts[i].posterUID).toString();
        }
        console.log("Getting Foreign Account Data");
        const PosterInfo = await GetForeignAccounts(wantedUIDs);
        console.log("Starting For Loop");
        for (let i = 0; i < posts.length; i++) {
            if (posts[i].posterUID === 0) {
                break;
            }

            const pDiv = document.createElement("div");
            const postsDiv = document.getElementById("posts");
            pDiv.id = "post" + nextPostDivID.toString();
            pDiv.className = "post";

            pDiv.setAttribute("postID", posts[i].postid.toString());
            pDiv.setAttribute("posterUID", posts[i].posterUID.toString());
            pDiv.setAttribute("postDivID", nextPostDivID.toString());

            postsDiv.append(pDiv);

            const posterinfo = document.createElement("div");
            posterinfo.id = "posterinfo" + nextPostDivID.toString();
            posterinfo.className = "posterinfo";
            pDiv.append(posterinfo);

            const posterButton = document.createElement("button");
            posterButton.className = "posterinfo";
            posterButton.onclick = handleClickedForeignAccount;
            posterinfo.append(posterButton);

            const pfpimage = document.createElement("img");
            pfpimage.width = 64;
            pfpimage.height = 64;
            pfpimage.className = "profileimage"
            try {
                pfpimage.src = PosterInfo[i].pfp;
            }
            catch {
                pfpimage.src = "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg";
            }

            posterButton.append(pfpimage);

            const username = document.createElement("h3");
            username.className = "postername"
            username.textContent = PosterInfo[i].username;
            posterButton.append(username);

            const postDate = document.createElement("h4");
            postDate.className = "posterdate";
            const postedDate = getDateDifference(posts[i].datePosted);
            postDate.textContent = postedDate;
            posterButton.append(postDate);

            /* Comment Div */

            const commentButton = document.createElement("button");
            commentButton.className = "rlcbuttons";
            commentButton.onclick = handleClickedCommentButton.bind(this, posts[i].postid, posts[i].commentAmt);
            posterinfo.append(commentButton);


            const commentDiv = document.createElement("div");
            commentDiv.className = "icondiv";
            commentButton.append(commentDiv);

            const commentIcon = document.createElement("img");
            commentIcon.className = "icon";
            commentIcon.src = "/icons/commenticon.png";
            commentIcon.width = 16;
            commentIcon.height = 16;
            commentDiv.append(commentIcon);

            const postcmtamt = document.createElement("h4");
            postcmtamt.className = "postcommentamount";
            postcmtamt.textContent = posts[i].commentAmt.toString();
            commentDiv.append(postcmtamt);

            /* Like Div */

            const likeButton = document.createElement("button");
            likeButton.className = "rlcbuttons";
            likeButton.onclick = handleClickedLikeButton.bind(this, posts[i].postid);
            posterinfo.append(likeButton);

            const likeDiv = document.createElement("div");
            likeDiv.className = "icondiv"
            likeButton.append(likeDiv);

            const likeIcon = document.createElement("img");
            likeIcon.className = "icon";
            likeIcon.id = "likeicon" + posts[i].postid.toString();
            const likeArray = posts[i].likes.split(",");
            likeIcon.src = "/icons/likeicon.png";
            for (let j = 0; j < likeArray.length; j++) {
                if (likeArray[j] == localStorage.getItem("uid")) {
                    likeIcon.src = "/icons/likeiconfull.png";
                    break;
                }
            }           
            likeIcon.width = 16;
            likeIcon.height = 16;
            likeDiv.append(likeIcon);

            const postlkamt = document.createElement("h4");
            postlkamt.className = "postlikeamount";
            postlkamt.id = "likeamt" + posts[i].postid.toString();
            postlkamt.textContent = posts[i].likeAmt.toString();
            likeDiv.append(postlkamt);

            /* Repost Div */

            const repostButton = document.createElement("button");
            repostButton.className = "rlcbuttons";
            repostButton.onclick = handleClickedRepostButton.bind(this, posts[i].postid.toString());
            posterinfo.append(repostButton);

            const repostDiv = document.createElement("div");
            repostDiv.className = "icondiv";
            repostButton.append(repostDiv);

            const repostIcon = document.createElement("img");
            repostIcon.className = "icon";
            repostIcon.src = "/icons/reposticon.png";
            repostIcon.width = 16;
            repostIcon.height = 16;
            repostDiv.append(repostIcon);

            const postrpamt = document.createElement("h4");
            postrpamt.className = "postrepostamount";
            postrpamt.textContent = posts[i].repostAmt.toString();
            repostDiv.append(postrpamt);

            /* Post content */

            const postcontent = document.createElement("div");
            postcontent.id = "postcontent" + nextPostDivID.toString();
            postcontent.className = "postcontent";
            pDiv.append(postcontent);

            const pcontenttext = document.createElement("h4");
            pcontenttext.id = "postcontenttext" + nextPostDivID.toString();
            pcontenttext.className = "postcontenttext";
            pcontenttext.textContent = posts[i].postText;
            postcontent.append(pcontenttext);

            const pcontentimg = document.createElement("img");
            pcontentimg.src = posts[i].images;
            pcontentimg.id = "postcontentimg" + nextPostDivID.toString();
            if (posts[i].images == "") {
                pcontentimg.width = 0;
                pcontentimg.height = 0;
            } 
            pcontentimg.className = "postcontentimg"
            postcontent.append(pcontentimg);

            nextPostDivID++;
        }
    }

    const removePosts = async () => {
        while (document.getElementsByClassName("post").length > 0) {
            const children = document.getElementsByClassName("post");
            for (let i = 0; i < children.length; i++) {
                children[i].remove();
            }
        }
    }

    function getDateDifference(date: string) {

        const dateLocal = new Date();
        const dateLocalISO = dateLocal.toISOString();
        console.log("Post time " + date + " Local time: " +dateLocalISO);

        const dateTimeForiegn = date.split("T")
        
        const ymdArrayForeign = dateTimeForiegn[0].split("-");
        const timeArrayForeign = dateTimeForiegn[1].split(":");
        timeArrayForeign[2] = timeArrayForeign[2].slice(1, 2);

        
        const dateTimeLocal = dateLocalISO.split("T");      
        const ymdArrayLocal = dateTimeLocal[0].split("-");
        const timeArrayLocal = dateTimeLocal[1].split(":");
        
        timeArrayLocal[2] = timeArrayLocal[2].slice(0, 2);
        console.log(timeArrayLocal);
        let isY = 0;

        if (parseInt(ymdArrayForeign[0]) < parseInt(ymdArrayLocal[0])) {

            const yDiff = parseInt(ymdArrayLocal[0]) - parseInt(ymdArrayForeign[0]);

            if (yDiff > 1) {
                return yDiff.toString() + "y"
            }
            isY = 12;
        }

        let leapYear = false;

        if (parseInt(ymdArrayLocal[0]) % 4 === 0) {
            leapYear = true;
        }
        if (parseInt(ymdArrayLocal[0]) % 100 === 0) {
            leapYear = false;
        }
        if (parseInt(ymdArrayLocal[0]) % 400 === 0) {
            leapYear = true;
        }

        if (parseInt(ymdArrayForeign[1]) < parseInt(ymdArrayLocal[1])) {
            const mDiff = (parseInt(ymdArrayLocal[1]) + isY) - parseInt(ymdArrayForeign[1]);

            if (mDiff < 2) {
                let dDiff = 0;
                const month = parseInt(ymdArrayLocal[1]); 

                if (month === 1 || month === 2 || month === 4 || month === 6 || month === 8 || month === 10) {
                    dDiff = (parseInt(ymdArrayLocal[2]) + 31) - parseInt(ymdArrayForeign[2]);
                    return dDiff.toString() + "d";
                }

                if (month === 3) {
                    if (leapYear) {
                        dDiff = (parseInt(ymdArrayLocal[2]) + 29) - parseInt(ymdArrayForeign[2]);
                    }
                    else {
                        dDiff = (parseInt(ymdArrayLocal[2]) + 28) - parseInt(ymdArrayForeign[2]);
                    }
                    return dDiff.toString() + "d";
                }

                if (month === 5 || month === 7 || month === 10 || month === 12) {
                    dDiff = (parseInt(ymdArrayLocal[2]) + 30) - parseInt(ymdArrayForeign[2]);
                    return dDiff.toString() + "d";
                }
            }

            return mDiff.toString() + "m";
        }

        console.log("Checking if posted this month. Day Posted: " + ymdArrayForeign[2].toString() + " Today: " + ymdArrayLocal[2].toString());
        if (parseInt(ymdArrayForeign[2]) < parseInt(ymdArrayLocal[2])) {
            const dDiff = parseInt(ymdArrayLocal[2]) - parseInt(ymdArrayForeign[2]);
            return dDiff.toString() + "d";
        }

        console.log("Posted Today, checking time. " + " Hour Posted: " + timeArrayForeign[0].toString() + " Hour Right Now: " + timeArrayLocal[0].toString());
        if (parseInt(timeArrayForeign[0]) != parseInt(timeArrayLocal[0])) {
            const hDiff = (parseInt(timeArrayLocal[0])) - parseInt(timeArrayForeign[0]);
            return hDiff.toString() + "h";
        }

        if (parseInt(timeArrayForeign[1]) < parseInt(timeArrayLocal[1])) {
            const mDiff = (parseInt(timeArrayLocal[1])) - parseInt(timeArrayForeign[1]);
            return mDiff.toString() + "m";
        }

        if (parseInt(timeArrayForeign[2]) < parseInt(timeArrayLocal[2])) {
            const sDiff = (parseInt(timeArrayLocal[2])) - parseInt(timeArrayForeign[2]);
            return sDiff.toString() + "s";
        }

    }


    /* Parse Comments 
            JSON Layout:
                @"{
                  ""CommentText"": ""Test Comment"",
                  ""UID"":1,
                  ""CommentOnCommentID"":0;
                  ""CommentID"":1,
                  ""Comments"":[
                        {
                        ""CommentText"": ""Test Commment Comment"",
                        ""UID"":2,
                        ""CommentOnCommentID"":1;
                        ""CommentID"":2,
                        ""Comments"":[
                            {
                            ""CommentText"": ""Test Commment Comment Comment"",
                            ""UID"":3,
                            ""CommentOnCommentID"":2;
                            ""CommentID"":4,
                            ""Comments"":[
                    
                             ]
                            }
                         ]
                        },
                    {
                        ""CommentText"": ""Test Comment 2"",
                        ""UID"": 3,
                        ""CommentOnCommentID"":1;
                        ""CommentID"":3,
                        ""Comments"":[
                        ]
                    }
            
                   ]
                }";

        Comment Display:

                <div className="commentsDiv" id="commentsDiv">
                    <div className="commentDiv" commentID=X> posterUID=X commentOnComment=commentID hasReplyButton=true>

                        <div className="commenterDiv">
                            <img src="" />
                            <h3>username</h3>
                        </div>
                        <div className="commentText">
                            <h3>text</h3>
                        </div>

                        <button className="showReplyButton" onClick={showReplies}>Show Replies</button>

                        <div className="commentCommentDiv">

                            <div className="commentDiv" commentID=X> posterUID=X commentOnComment=commentID hasReplyButton=false>
                                <div className="commenterDiv">
                                    <img src="" />
                                    <h3>username</h3>
                                </div>
                                <div className="commentBody">
                                    <h3>text</h3>
                                </div>
                                <div className="commentCommentDiv">
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
    */

    // Comments and Replies

    async function parseComments(data: CommentData[]) {

        removeComments();

        if (data[0].commentText === undefined) {
            const addCommentReplyButton = document.createElement("button");
            addCommentReplyButton.className = "replyButton";
            addCommentReplyButton.textContent = "Add Comment";

            addCommentReplyButton.onclick = openAddCommentButton.bind(this, 0);
            const commentsDiv = document.getElementById("commentsDiv");
            commentsDiv.append(addCommentReplyButton);
            return;
        }

        const commentsToProcess = data;
        const uids = [];

        /* These array will align with the same index as the uid array */
        const pfps = [];
        const usernames = [];

        const commentsDiv = document.getElementById("commentsDiv");
        while (commentsToProcess.length > 0) {

            uids.push(commentsToProcess[0].uid);
            console.log("UID: " + commentsToProcess[0].uid);
            const commentDiv = document.createElement("div");
            commentDiv.className = "comment";
            commentDiv.setAttribute("commentID", (commentsToProcess[0].commentID.toString()));
            commentDiv.setAttribute("posterUID", (commentsToProcess[0].uid.toString()));
            commentDiv.setAttribute("commentOnComment", (commentsToProcess[0].commentOnCommentID.toString()));
            commentDiv.setAttribute("hasReplyButton", "false");

            if (commentsToProcess[0].commentOnCommentID === 0) {
                commentsDiv.append(commentDiv);
            }
            else {
                const comments = document.getElementsByClassName("comment");
                for (let i = 0; i < comments.length; i++) {

                    if (comments[i].getAttribute("commentID") == commentsToProcess[0].commentOnCommentID.toString()) {
                        const commentChildren = comments[i].children;

                        for (let j = 0; j < commentChildren.length; j++) {

                            if (commentChildren[j].className === "commentCommentDiv") {
                                commentChildren[j].append(commentDiv);
                                commentDiv.style.display = "none";
                                break;
                            }
                        }
                        break;
                    }
                }
            }
            

            const commenterDiv = document.createElement("div");
            commenterDiv.className = "commenterInfo";
            commentDiv.append(commenterDiv);


            const pfp = document.createElement("img");
            pfps.push(pfp);
            pfp.className = "commenterPFP";
            pfp.width = 64;
            pfp.height = 64;
            commenterDiv.append(pfp);

            const username = document.createElement("h3")
            username.className = "commenterName";
            usernames.push(username);
            commenterDiv.append(username);

            const commentBody = document.createElement("div");
            commentBody.className = "commentBody";
            commentDiv.append(commentBody);

            const commentText = document.createElement("h3");
            commentText.textContent = commentsToProcess[0].commentText;
            commentBody.append(commentText);

            const addCommentReplyButton = document.createElement("button");
            addCommentReplyButton.className = "replyButton";
            addCommentReplyButton.textContent = "Add Reply";
            addCommentReplyButton.onclick = openAddCommentButton.bind(this, commentsToProcess[0].commentID.toString());
            commentDiv.append(addCommentReplyButton);

            try {
                const checkReplies: CommentData[] = commentsToProcess[0].comments
                if (checkReplies[0].commentText != undefined) {
                    const replyButton = document.createElement("button");
                    replyButton.className = "replyButton";
                    replyButton.textContent = "Show Replies"
                    replyButton.onclick = showReplies.bind(this, replyButton, commentsToProcess[0].commentID.toString());

                    commentDiv.append(replyButton);
                }
            }
            catch {
                console.log("No replies");
            }

            const commentCommentDiv = document.createElement("div");
            commentCommentDiv.className = "commentCommentDiv";
            commentDiv.append(commentCommentDiv);
            
            const replyArray: CommentData[] = commentsToProcess[0].comments
            if (replyArray != undefined) {
                for (let i = 0; i < replyArray.length; i++) {
                    commentsToProcess.push(replyArray[i]);
                }    
            }


            commentsToProcess.shift();

        }

        const foreignAccounts: ForeignAccountInfo[] = await GetForeignAccounts(uids);
        for (let i = 0; i < pfps.length; i++) {
            pfps[i].src = foreignAccounts[i].pfp;
        }
        for (let i = 0; i < usernames.length; i++) {
            usernames[i].textContent = foreignAccounts[i].username;
        }
    }

    const addComment = async (commentString: string) => { 
        
        const content = new FormData();
        content.append("uid", localStorage.getItem("uid"));
        content.append("token", localStorage.getItem("sessionid"));
        content.append("postID", setPostID.toString());
        content.append("commentID", setCommentOnCommentID.toString());
        content.append("commentText", commentString);

        try {
            const response = await fetch('../api/mimiraddcomment', {
                method: "POST",
                body: content
            })
            if (!response.ok) {
                alert("Clicked Account Response Fail");
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            
        }
        catch (err) {
            console.error('Error setting description: ', err)
        }
    }

    
    function removeComments() {
        const commentsDiv = document.getElementById("commentsDiv");
        const allComments = commentsDiv.children;
        for (let i = 0; i < allComments.length; i++) {
            allComments[i].remove();
        }
    }
   

    const showComments = (postid: number) => {

        // document.getElementById("reply").style.display = "flex";
        getComments(postid);
    }

    const getComments = async (postID: number) => {
        setPostID = postID;
        try {
            const response = await fetch('../api/mimirgetcomments?postID=' + postID.toString(), {
                method: "POST",
            })
            if (!response.ok) {
                alert("Clicked Account Response Fail");
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data: CommentData[] = await response.json();
            
            console.log(data[0].commentText);
            parseComments(data);
            const replyDiv = document.getElementById("reply");;
            replyDiv.style.display = "block";
        }
        catch (err) {
            console.error('Error setting description: ', err)
        }
    }

    function showReplies(button: HTMLElement, commentID: string) {
        // console.log("Getting Replies from: " + commentID + " Button Element: " + button.className);
        const elements = document.querySelectorAll<HTMLElement>("*");
        for (let i = 0; i < elements.length; i++) {
            if (elements[i].getAttribute("commentOnComment") === commentID.toString()) {
                elements[i].style.display = "block";
                let parentDiv = elements[i].parentElement.parentElement;
                let amtToSpace = 1;
                while (true) {
                    if (parentDiv.getAttribute("commentOnComment") != "0") {
                        parentDiv = parentDiv.parentElement.parentElement;
                        amtToSpace++;
                    }
                    else {
                        parentDiv.style.paddingBottom = (amtToSpace * 17).toString() + "vh";
                        
                        break;
                    }
                    if (amtToSpace >= 100) {
                        break;
                    }
                }

                button.style.display = "none";
                break;
            }
        }
    }

    function handleClickedRepostButton(postID: number) {
        
        
    }
    function handleClickedCommentButton(postID: number, amtComments: number) {
        console.log("Amount Comments: " + amtComments.toString());
        removeComments();
        if (amtComments === 0) {
            setPostID = postID;
            openAddCommentButton(0);
        }
        else {
            showComments(postID)
        }   
    }

    function handleClickedAddCommentButton(event: React.FormEvent<HTMLFormElement>) {
        if (event.currentTarget.commenttextarea.value === undefined) { return; }
        if (event.currentTarget.commenttextarea.value === "") { return; }
        addComment(event.currentTarget.commenttextarea.value);
    }

    function openAddCommentButton(commentOnCommentID: number) {
        setCommentOnCommentID = commentOnCommentID;
        console.log("Current Comment On Comment ID: " + setCommentOnCommentID.toString());
        let element = document.getElementById("reply");
        element.style.display = "none";
        element = document.getElementById("addcomment");
        element.style.display = "block";

    }

    // Infinite Scroll
    const handleScroll = (e) => {
        const bottom = e.target.scrollHeight - e.target.scrollTop - e.target.clientHeight < 10;
        if (bottom) {
            console.log("bottom")
            getScrollPosts();
        }
    }

    function getScrollPosts() {

    }



  return (
      <main className="main" onLoad={StartScript}>
          <div id="sidebar" className="sidenav">
              <div id="homeSideNav" className="sidenavitem">
                  <button onClick={handleHomeButton}>Home</button>
              </div>

              <div id="feedsSideNav" className="sidenavitem">
                  <button onClick={handleFeedsButton}>Feeds</button>
              </div>

              <div id="accountSideNav" className="sidenavitem">
                  <button onClick={handleAccountButton}>Account</button>
              </div>

              <div id="newPostSideNav" className="sidenavitem">
                  <button onClick={handleNewPostButton}>New Post</button>
              </div>
          </div>
          <div id="body" onScroll={handleScroll}>

              <div id="home">
                  <div className="home">
                  </div>
              </div>

              <div id="feeds" className="startnone">
              </div>

              <div id="account" className="startnone">
                  <button id="profilebannerbutton" onClick={handleEditBannerButton}>
                      <img className="profilebanner" src="/tmpbanner.jpeg" height="1500" width="500" id="accountbanner" />
                  </button>
                  <div className="account">
                      <button id="accountpfpbutton" onClick={handleEditPFPButton} className="editbutton">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg" width="128" height="128" className="profileimage" id="accountpfp" />
                      </button>
                    <div id="accountname" className="profilename">
                          <button id="accountname" className="profilename" onClick={handleEditDescriptionButton}>Username</button>
                    </div>
                    <div id="accountdesc" className="profiledesc">
                          <button id="editaccountdesc" className="editbutton" onClick={handleEditDescriptionButton}>Add a profile description!</button>
                    </div>
                      <div id="followeramt" className="following">
                          <h3>Followers</h3>
                          <h3 id="followingnumber" className="following">0</h3>
                    </div>
                      <div id="followingamt" className="following">
                      <h3>Following</h3>
                          <h3 id="following" className="following">0</h3>
                      </div>
                  </div>
              </div>

              <div id="newpost">
              </div>

              <div id="foreignaccount" >
              </div>

          </div>

          <div id="posts">



          </div>

          <div id="testdivs">

              <div id="posttest" className="post">
                  <div id="posterinfodiv" className="posterinfo">
                      <button className="posterinfo">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg" width="64" height="64" className="profileimage" />
                          <h3 className="postername">Username</h3>
                          <h4 className="posterdate">Post Date</h4>
                          <button className="icondiv" onClick={showReplies}>
                              <img src="/icons/commenticon.png" width="16" height="16" className="icon"/>
                              <h4 className="postcommentamount">0</h4>
                          </button>
                          <button className="icondiv">
                              <img src="/icons/likeicon.png" width="16" height="16" className="icon" />
                              <h4 className="postlikeamount">0</h4>
                          </button>
                          <button className="icondiv">
                              <img src="/icons/reposticon.png" width="16" height="16" className="icon" />
                              <h4 className="postrepostamount">0</h4>
                          </button>
                      </button>
                  </div>
                  <div id="postcontent" className="postcontent">
                    <h4 id="postcontenttext" className="postcontenttext">Temp</h4>
                    <img src="" id="postcontentimg" className="postcontentimg"/>
                  </div>
              </div>

              

          </div>

          <div id="popups">
              <div id="editprofiledesc" className="modal">
                <div className="modalcontent">
                  <form id="editdescform" onSubmit={handleDescInputSubmit}>
                        <textarea
                          form="editdescform"
                          id="desctextarea"
                          placeholder="Add your new description here!"
                          className="inputfield"
                          maxLength={500}
                          rows={10}
                          cols={40}
                          autoCorrect="on"
                          spellCheck="true"
                        />
                    <button type="submit" className="modalbutton">Submit</button>
                  </form>
                </div>
              </div>

              <div id="editpfp" className="modal">
                <div className="modalcontent">
                      <input type="file" onChange={onFileChangePFP} accept="image/jpeg, image/png" className="fileuploadfield" />
                      <button onClick={handlePFPImageFileUpload} className="fileuploadbutton">Submit</button>
                </div>
              </div>
              <div id="editbanner" className="modal">
                  <div className="modalcontent">
                      <input type="file" onChange={onFileChangeBanner} accept="image/jpeg, image/png" className="fileuploadfield" />
                      <button onClick={handleProfileBannerImageUpload} className="fileuploadbutton">Submit</button>
                  </div>
              </div>

              <div id="newposteditor" className="modal">
                  <div className="modalcontent">
                      <form id="newpostform" onSubmit={handleNewPostSubmit}>
                          <textarea
                              form="newpostform"
                              id="newposttextarea"
                              placeholder="What to talk about?"
                              className="inputfield"
                              maxLength={500}
                              rows={10}
                              cols={40}
                              spellCheck="true"
                          />
                          <input id="newpostfile" type="file" accept="image/jpeg, image/png" className="fileuploadfield" />
                          <button type="submit" className="modalbutton">Submit</button>
                      </form>
                  </div>
              </div>

              <div id="reply" className="modal">
                  <div className="modalcontent">
                      
                        <div id="commentsDiv">
                          </div>
                      
                      <div>
                          <button className="replyButton" onClick={openAddCommentButton.bind(this, 0)}>Add Comment</button>
                      </div>   
                  </div>
              </div>

              <div id="addcomment" className="modal">
                  <div className="modalcontent">
                      <form id="addcommentform" onSubmit={handleClickedAddCommentButton}>
                          <textarea
                              form="addcommentform"
                              id="commenttextarea"
                              placeholder="Add your comment here!"
                              className="inputfield"
                              maxLength={500}
                              rows={10}
                              cols={40}
                              autoCorrect="on"
                              spellCheck="true"
                          />
                          <button type="submit" className="modalbutton">Submit</button>
                      </form>
                  </div>
              </div>
          </div>
          
      </main>
    );
}

export default home;
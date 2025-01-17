let currentsong = new Audio();
let songs;
let currfolder;
document.querySelector(".loginpage").style.display = 'none';
document.querySelector(".signuppage").style.display = 'none';
let loggedInUser = null;
let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let audioContext;
let audioStream;

function showPopupMessage(message, color) {
    const popup = document.createElement('div');
    popup.textContent = message;
    popup.style.position = 'fixed';
    popup.style.bottom = '20px';
    popup.style.right = '20px';
    popup.style.backgroundColor = color;
    popup.style.color = 'white';
    popup.style.padding = '10px 20px';
    popup.style.borderRadius = '5px';
    popup.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    popup.style.zIndex = '1000';
    document.body.appendChild(popup);

    setTimeout(() => {
        popup.remove();
    }, 3000);
}

// Update UI to show username and sign-out option
function updateUserUI() {
    const navButtonContainer = document.querySelector('.navbutton');
    if (loggedInUser) {
        navButtonContainer.innerHTML = `
            <button class="userbutton">
                <i class="fas fa-user-circle profile-icon"></i> ${loggedInUser} <span class="arrow">▼</span>
            </button>
            <div class="dropdown" style="display: none;">
                <button class="signoutbutton">Sign Out</button>
            </div>
        `;

        const userButton = document.querySelector('.userbutton');
        const dropdown = document.querySelector('.dropdown');

        userButton.addEventListener('click', () => {
            const isHidden = dropdown.style.display === 'none';
            dropdown.style.display = isHidden ? 'block' : 'none';
            userButton.querySelector('.arrow').textContent = isHidden ? '▲' : '▼';
        });

        document.querySelector('.signoutbutton').addEventListener('click', () => {
            loggedInUser = null;
            localStorage.removeItem('loggedInUser'); // Remove from localStorage
            showPopupMessage('You have signed out successfully!', 'green');
            updateUserUI();
        });
    } else {
        navButtonContainer.innerHTML = `
            <button id="SignUp" class="signup">Sign Up</button>
            <button id="LogIn" class="login">Log In</button>
        `;

        document.querySelector('.signup').addEventListener('click', function () {
            document.querySelector('.signuppage').style.zIndex = "1000";
            togglesignup();
        });

        document.querySelector('.login').addEventListener('click', function () {
            document.querySelector('.loginpage').style.zIndex = "1000";
            togglelogin();
        });
    }
}

async function signup(username, password) {
    try {
        const response = await fetch('http://localhost:3000/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (response.ok) {
            loggedInUser = username;
            localStorage.setItem('loggedInUser', username); // Save to localStorage
            showPopupMessage('Account created successfully!', 'green');
            updateUserUI();
        } else {
            showPopupMessage(data.message, 'red');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function login(username, password) {
    try {
        console.log('Login payload:', { username, password }); // Debug payload
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        console.log('Server response:', data); // Debug server response

        if (response.ok) {
            loggedInUser = username;
            localStorage.setItem('loggedInUser', username); // Save to localStorage
            showPopupMessage('Logged in successfully!', 'green');
            document.querySelector('.loginpage').style.display = 'none'; // Close login page
            updateUserUI();
        } else {
            showPopupMessage('Incorrect username or password. Please try again.', 'red');
            document.getElementById('password').value = ''; // Clear password field
        }
    } catch (error) {
        console.error('Error:', error);
        showPopupMessage('An error occurred during login. Please try again later.', 'red');

    }
}


function initializeUserSession() {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
        loggedInUser = storedUser;
    }
    updateUserUI();
}

// Attach to form submission
document.getElementById('loginForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    login(username, password);
});

document.getElementById('signupForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const username = document.getElementById('usernameinput').value;
    const password = document.getElementById('passwordinput').value;
    signup(username, password);
});

// Initialize user session on page load
initializeUserSession();


function formatTime(seconds) {
    // Convert seconds to whole minutes and remaining seconds
    if (isNaN(seconds || seconds < 0)) {
        return "00:00";
    }
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = Math.floor(seconds % 60);

    // Format minutes and remaining seconds with leading zeros
    var formattedMinutes = (minutes < 10 ? '0' : '') + minutes;
    var formattedSeconds = (remainingSeconds < 10 ? '0' : '') + remainingSeconds;

    // Return formatted time
    return formattedMinutes + ':' + formattedSeconds;
}

function toggleSectionVisibility() {
    var a = document.querySelector('.left');
    if (a.style.display === 'none') {
        a.style.display = 'block';
    }
    else {
        a.style.display = 'none';
    }
}
function togglelogin() {
    var b = document.querySelector('.loginpage');
    if (b.style.display === 'none') {
        b.style.display = 'block';
    }

}
function togglesignup() {
    var c = document.querySelector('.signuppage');
    if (c.style.display === 'none') {
        c.style.display = 'block';
    }

}

function closeSlideInPage() {
    var slideInPage = document.querySelector(".left");
    slideInPage.style.display = 'none';
}
function closeloginpage() {
    var slideInPage = document.querySelector(".loginpage");
    slideInPage.style.display = 'none';
}
function closesignuppage() {
    var slideInPage = document.querySelector(".signuppage");
    slideInPage.style.display = 'none';
}

// Function to simulate checking login status
function checkLoginStatus() {
    // Check if there is a logged-in user in localStorage
    return localStorage.getItem("loggedInUser") !== null;
}

// Function to handle Create Playlist button click
function createPlaylist() {
    // Check if the user is logged in
    const isLoggedIn = checkLoginStatus();

    if (isLoggedIn) {
        // Allow the user to create a playlist
        displayAllSongsForSelection();
    } else {
        // Show a popup message at the bottom
        showPopupMessage("You need to login first", "red");
    }
}


// Function to gather all songs dynamically from the songs folder
async function gatherAllSongs() {
    try {
        // Fetch song names from the server (adjust the path if necessary)
        const response = await fetch('/songs/');
        const data = await response.text();

        // Parse the response to extract song names (assuming the response is HTML)
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'text/html');
        const songLinks = doc.querySelectorAll('a'); // Assuming songs are linked in <a> tags

        const songs = [];
        songLinks.forEach(link => {
            const songName = link.getAttribute('href');
            if (songName.endsWith('.mp3')) {
                songs.push(decodeURIComponent(songName.split('/').pop())); // Extract and decode the song name
            }
        });

        return songs;
    } catch (error) {
        console.error('Error fetching songs:', error);
        return [];
    }
}

// Display all songs for selection
async function displayAllSongsForSelection() {
    // Fetch all songs dynamically
    const allSongs = await gatherAllSongs();

    if (allSongs.length === 0) {
        showPopupMessage('No songs found in the songs folder.', 'red');
        return;
    }

    // Create a modal or section to display songs
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    modal.style.color = 'white';
    modal.style.zIndex = '1000';
    modal.style.padding = '20px';
    modal.style.overflowY = 'auto';

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.marginBottom = '10px';
    closeButton.onclick = () => modal.remove();
    modal.appendChild(closeButton);

    // Add a container for songs
    const songList = document.createElement('div');
    songList.innerHTML = '<h3>Select Songs for Your Playlist</h3>';

    allSongs.forEach((song, index) => {
        const songItem = document.createElement('div');
        songItem.style.marginBottom = '10px';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `song-${index}`;
        checkbox.value = song;

        const label = document.createElement('label');
        label.htmlFor = `song-${index}`;
        label.textContent = song;

        songItem.appendChild(checkbox);
        songItem.appendChild(label);
        songList.appendChild(songItem);
    });

    // Add a button to save the playlist
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save Playlist';
    saveButton.style.marginTop = '20px';
    saveButton.onclick = () => saveCustomPlaylist(songList, modal);

    modal.appendChild(songList);
    modal.appendChild(saveButton);
    document.body.appendChild(modal);
}


// Save the custom playlist
function saveCustomPlaylist(songList, modal) {
    const selectedSongs = [];
    const checkboxes = songList.querySelectorAll("input[type='checkbox']");
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedSongs.push(checkbox.value);
        }
    });

    if (selectedSongs.length === 0) {
        showPopupMessage("No songs selected. Please select songs to create a playlist.", "yellow");
    } else {
        const playlistName = prompt("Enter a name for your playlist:");
        if (playlistName) {
            const customPlaylists = JSON.parse(localStorage.getItem("customPlaylists")) || {};
            customPlaylists[playlistName] = selectedSongs;
            localStorage.setItem("customPlaylists", JSON.stringify(customPlaylists));
            showPopupMessage("Playlist created successfully!", "green");
            // modal.remove();
        }
    }
}



// Function to show a popup message
function showLoginPopup(message) {
    const popup = document.createElement("div");
    popup.textContent = message;
    popup.style.position = "fixed";
    popup.style.bottom = "20px";
    popup.style.left = "50%";
    popup.style.transform = "translateX(-50%)";
    popup.style.backgroundColor = "red";
    popup.style.color = "white";
    popup.style.padding = "10px 20px";
    popup.style.borderRadius = "5px";
    popup.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.2)";
    popup.style.zIndex = "1000";
    popup.style.fontFamily = "Arial, sans-serif";
    popup.style.fontSize = "14px";

    // Add the popup to the document body
    document.body.appendChild(popup);

    // Remove the popup after 3 seconds
    setTimeout(() => {
        popup.remove();
    }, 3000);
}

// // Simulate login (for testing)
// function login() {
//     localStorage.setItem("userLoggedIn", "true");
//     alert("You are now logged in!");
// }

// // Simulate logout (for testing)
// function logout() {
//     localStorage.removeItem("userLoggedIn");
//     alert("You are now logged out!");
// }


async function getsongs(folder) {      //i.e getsongs function will take folder name as parameter so as to 
    currfolder = folder;
    let a = await fetch(`/songs/${folder}/`)   //here we removedthe /songs by /${folder} becoz directly we want to create dynamic folders  which are related to the cards.
    let response = await a.text();
    // console.log(response);

    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    console.log(as);         //since it will show all the anchor tags so we will now target only those with extension as mp3(i.e songs) in the href
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])    //here 1 means the later part of the array as the index 1 comes after index 0.   
            //So after the songs/ (in href) sentence coming will be takem as href gives -"http://127.0.0.1:5500/songs/_Ambarsariya_Fukrey__Song_By_Sona_Mohapatra___Pulkit_Samrat%2C_Priya_Anand(128k).mp3" will be separated and first part will be taken
        }
    }

    // this below code section make sure to add the songs in the list and show it
    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songul.innerHTML = ""
    for (const song of songs) {      //sing songs is the array
        songul.innerHTML = songul.innerHTML + `<li class="limusic flex"><img src="music.svg" class="invert" alt="">
                                <div class="info flex justify align">
                                    <div>${song.replaceAll("%20", " ")}</div>
                                    <div>Mayank</div>
                
                                 </div>
                                <div class="playnow flex justify align">
                                    <span>Play Now</span>
                                    <img class="invert" src="play.svg" alt="">
                                </div>
                                </li>`;
        // note that here replace function replaces only first encountered %20 but replaceAll replaces all %20
        //it will give u the song urls and not their name so for that we use split function above while adding elements in the songs.push so that the whole href is not taken he trimmed(splitted) part is taken.
    }

    // below code is taken from googe to how to play the audio
    // var audio=new Audio(songs[0]);
    // audio.play(); 
    // above 2 line code can be runned to run the 1st song in the songs folder but since we need to make a user interactive website so we will play it only when clicked on play button 
    //audio will be played once but will give "Uncaught (in promise) DOMException: play() failed because the user didn't interact with the document first" as the error on console

    // so we will give the eventlistener for user interaction
    // audio.addEventListener("loadeddata",()=>{
    // let duration = audio.duration;
    // console.log(duration);
    // duration variable holds the duration of the audio clips in seconds
    // but note that this will update the duration only one time but we want it to update multiple times
    //     console.log(audio.duration,audio.currentSrc,audio.currentTime);
    // })



    // now attach an event listener
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {

        e.addEventListener("click", element => {

            // console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playmusic(e.querySelector(".info").firstElementChild.innerHTML);
            //note that trim() function removes the each and every spaces 



        })


    })
    return songs;
}
// play=false as the second argument of playmusic function
const playmusic = (track, pause = false) => {
    // let audio = new Audio("/84SpotifyClone/songs/" + track);
    // audio.play();

    currentsong.src = `/songs/${currfolder}/` + track;
    if (!pause) {
        currentsong.play();
        play.src = "pause.svg"
    }
    // currentsong.play();
    // play.src = "pause.svg"
    // sometimes it may happen that on showing the song name on the playbar %20 will come at the place of spaces so to remove that %20 we need to decode the URI and for that we do decodeURI(track) below.This happend when we use the if condition above to make the first song to play as the default song on refreshing
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00/00:00"
}

async function displayAlbums() {
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
            playmusic(songs[0])

        })
    })
}

// function searchfolder() {
//     // Find all elements on the webpage that may contain playlist links
//     const inputvalue = document.getElementById('inputfolder').value.toLowerCase();
//     const songFolders = document.querySelectorAll('.card');
//     let matchFound = false;
//     console.log("Match finding")
//     Array.from(songFolders).forEach(folder => {
//         // Get the data-folder attribute value for the current folder
//         // console.log(folder.getAttribute('data-folder'))
//         const folderName = folder.getAttribute('data-folder').toLowerCase();
//         // console.log(folderName)
//         // Check if the input value matches the data-folder attribute value
//         if (inputvalue === folderName){

//             const searchedcard=document.querySelector(`.card[data-folder="${folderName}"]`)
//             searchedcard.style.display="block";
//             matchFound = true;
//         }
//         if(inputvalue!==folderName){
//             const searchedcard=document.querySelector(`.card[data-folder="${folderName}"]`)
//             searchedcard.style.display="none";
//         }

//     });
//     if (!matchFound) {
//         alert('No match found for folder: ' + inputvalue);
//     }
// }

document.getElementById('inputfolder').addEventListener('keydown', function (event) {
    // Check if the pressed key is 'Enter' (keyCode 13)
    if (event.key === 'Enter') {
        searchfolder();  // Call the search function
    }
});


document.querySelector('.left ul .searching').addEventListener('click', async function (event) {
    event.preventDefault(); // Prevent default behavior
    const initialized = await initializeAudioRecording();
    if (initialized) {
        toggleRecording(); // Toggle the recording state (start/stop)
    } else {
        console.error("Audio recording could not be initialized.");
    }
});



function searchfolder() {
    // Get the search input and convert it to lowercase for case-insensitive comparison
    const inputvalue = document.getElementById('inputfolder').value.toLowerCase();
    const songFolders = document.querySelectorAll('.card');
    let matchFound = false;

    console.log("Match finding");

    Array.from(songFolders).forEach(folder => {
        // Get the data-folder attribute value for the current folder
        const folderName = folder.getAttribute('data-folder').toLowerCase();

        // Get the text content of both the h4 and p elements (titles and descriptions)
        const heading = folder.querySelector('h4.card-description') ? folder.querySelector('h4.card-description').textContent.toLowerCase() : '';
        const description = folder.querySelector('p.card-description') ? folder.querySelector('p.card-description').textContent.toLowerCase() : '';

        // Combine both the heading and description text into one string
        const combinedText = heading + ' ' + description;

        // Split the combined text into words
        const combinedWords = combinedText.split(/\s+/);  // Split by spaces, handling multiple spaces

        // Check if the input value matches the folder name or any word in the combined heading/description
        if (folderName.includes(inputvalue) || combinedWords.some(word => word.includes(inputvalue))) {
            folder.style.display = "block";  // Show the card
            matchFound = true;
        } else {
            folder.style.display = "none";  // Hide the card if no match
        }
    });

    if (!matchFound) {
        alert('No match found for folder: ' + inputvalue);
    }
}

// Function to initialize audio recording capabilities
async function initializeAudioRecording() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });

        mediaRecorder = new MediaRecorder(audioStream);

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const audioUrl = URL.createObjectURL(audioBlob);
            currentsong.src = audioUrl;
            currentsong.play();
            play.src = "pause.svg";
            // Optional: Add recorded audio to the list of songs
            showPopupMessage("Audio recorded and ready to play!", "green");
        };

        return true;
    } catch (error) {
        console.error('Error initializing audio recording:', error);
        showPopupMessage('Unable to access microphone. Please check permissions.', 'red');
        return false;
    }
}

// Function to toggle recording
async function toggleRecording() {
    if (!mediaRecorder) {
        const initialized = await initializeAudioRecording();
        if (!initialized) return;
    }

    const audioButton = document.querySelector('.left ul .searching a');

    if (!isRecording) {
        // Start recording
        audioChunks = [];
        mediaRecorder.start();
        isRecording = true;
        showPopupMessage('Recording started...', 'green');
        audioButton.classList.add('recording'); // Add a CSS class for visual feedback

        // Update UI to show recording state
        document.querySelector('.record-button').classList.add('recording');
    } else {
        // Stop recording
        mediaRecorder.stop();
        isRecording = false;
        showPopupMessage('Recording stopped', 'yellow');
        document.querySelector('.record-button').classList.remove('recording');
    }
}

async function main() {


    // to get the list of all song
    await getsongs("hits");
    console.log(songs);   //it will give all the songs one by one on the console
    playmusic(songs[0], true)


    await displayAlbums();


    // attach an event listener on play,previous,next
    play.addEventListener("click", element => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "pause.svg"
        }
        else {
            currentsong.pause();
            play.src = "play.svg"
        }
    })

    // Listen for time update event
    currentsong.addEventListener("timeupdate", () => {
        const currentTime = formatTime(currentsong.currentTime);
        const duration = formatTime(currentsong.duration || 0);
        document.querySelector(".songtime").innerHTML = `${currentTime}/${duration}`;

        // Update seekbar position
        const percentage = ((currentsong.currentTime || 0) / (currentsong.duration || 1)) * 100;
        document.querySelector('.circle').style.left = `${percentage}%`;
    });
    // Add an event listner for seekbar to move the circle by click
    document.querySelector(".seekbar").addEventListener("click", e => {
        document.querySelector(".circle").style.left = (e.offsetX / e.target.getBoundingClientRect().width) * 100 + "%";
        // now to also make the currentTime of the song according to the position of seekbar we set the value of currentTime ,so
        currentsong.currentTime = ((currentsong.duration) * (e.offsetX / e.target.getBoundingClientRect().width) * 100) / 100
        // since (e.offsetX/e.target.getBoundingClientRect().width)*100 is the % value which is completed i.e till where the cicle has been moved
    })
    // getBoundingClientRect() this function tells that where we are pointing by telling the position's width,height,top,width,x,y
    // (e.offsetX/e.target.getBoundingClientRect().width)*100 this a value which is converted to percentage by adding +"%" in it and this is done becoz left property is given in % in the style.css

    // Add an event listner to show the left side of website on clicking on the hamburger so
    document.querySelector('.hamburger').addEventListener('click', function () {
        document.querySelector(".left").style.left = 0;
        toggleSectionVisibility();
    });
    // document.querySelector('.login').addEventListener('click', function () {
    //     document.querySelector('.loginpage').style.zIndex="1000";
    //     localStorage.setItem("userLoggedIn", "true");
    //     alert("You are now logged in!");
    //     togglelogin();
    // });

    document.addEventListener('DOMContentLoaded', () => {
        // Initialize Login Button
        const loginButton = document.querySelector('.login');
        if (loginButton) {
            loginButton.addEventListener('click', function () {
                const loginPage = document.querySelector('.loginpage');
                if (loginPage) {
                    loginPage.style.zIndex = "1000";
                    localStorage.setItem('userLoggedIn', "true");
                    alert("You are now logged in!");
                } else {
                    console.error("Login page not found.");
                }
            });
        } else {
            console.error("Login button not found in the DOM.");
        }

        // Initialize Signup Button
        const signupButton = document.querySelector('.signup');
        if (signupButton) {
            signupButton.addEventListener('click', function () {
                const signupPage = document.querySelector('.signuppage');
                if (signupPage) {
                    signupPage.style.zIndex = "1000";
                    togglesignup(); // Assuming this function handles signup modal behavior
                } else {
                    console.error("Signup page not found.");
                }
            });
        } else {
            console.error("Signup button not found in the DOM.");
        }
    });

    // document.querySelector('.signup').addEventListener('click', function () {
    //     document.querySelector('.signuppage').style.zIndex = "1000";
    //     togglesignup();
    // });

    // Add an event listener to previous music
    previous.addEventListener("click", () => {

        console.log("Previous Clicked");
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);        //this / is given becoz songs shown are in order so the next song after currentsong can be targeted by this method

        if ((index - 1) >= 0) {
            playmusic(songs[index - 1])
        }
        else {
            playmusic(songs[songs.length - 1])
        }

    })

    let users = [];

    // Function to handle login
    const handleLogin = (event) => {
        event.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        const user = users.find(user => user.username === username && user.password === password);
        if (user) {
            alert('Login successful!');
        } else {
            alert('Invalid username or password.');
        }
    };

    // Function to handle sign up
    const handleSignup = (event) => {
        event.preventDefault();
        const username = document.getElementById('signupUsername').value;
        const password = document.getElementById('signupPassword').value;

        if (username && password) {
            users.push({ username, password });
            alert('Sign up successful! You can now login.');
        } else {
            alert('Please enter a username and password.');
        }
    };

    // Event listeners
    //   document.getElementById('loginForm').addEventListener('submit', handleLogin);
    //   document.getElementById('signupForm').addEventListener('submit', handleSignup);


    // Add an event listener to next music
    next.addEventListener("click", () => {

        console.log("Next Clicked");
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);        //this / is given becoz songs shown are in order so the next song after currentsong can be targeted by this method

        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1])
        }
        else {
            playmusic(songs[0])
        }
    })

    // add an event to volume range bar
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        // console.log(e,e.target,e.target.value);
        currentsong.volume = parseInt(e.target.value) / 100;
    })

    // Load the playlist when u click a particular card
    // note that here Array.from is used becoz forEach cannot be used directly on tdocument.getElementsByClassName("card") becoz it is a collection so we will convert it into a Array form 
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            // console.log(item, item.currentTarget.dataset)
            songs = await getsongs(`${item.currentTarget.dataset.folder}`);
            // note that target here means the exact element which u click for eg in card also if u click on image,heading or paragraph then the songs will not load in the folder,they will only be loaded when u click on the card particularly at its extreme side.
            // but you can use currentTarget to avoid this so that even if u click on thge inner elements then also the even will occur which is mentioned.
            playmusic(songs[0])

        })
    })

    // to mute or unmute the voice
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentsong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentsong.volume = 0.10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 50;
        }

    })
    // Update error handling for audio playback
    currentsong.addEventListener("error", (e) => {
        console.error("Audio error:", e);
        showPopupMessage('Error playing audio. Please try again.', 'red');
    });

    initializeAudioControls();

}

// Add these event listeners after your existing main() function
function initializeAudioControls() {
    // Add record button to your HTML if not already present
    let controlsContainer = document.querySelector('.playbar .controls');

    if (!controlsContainer) {
        controlsContainer = document.createElement('div');
        controlsContainer.className = 'controls';
        document.querySelector('.playbar').appendChild(controlsContainer);
    }

    const recordButton = document.createElement('button');
    recordButton.textContent = 'Record';
    recordButton.classList.add('record-button');
    recordButton.addEventListener('click', initializeAudioRecording);

    controlsContainer.appendChild(recordButton);
}
main();

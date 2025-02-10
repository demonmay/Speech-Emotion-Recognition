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
    }, 5000);
}

function clearPlaylists() {
    const playlistsContainer = document.getElementById('playlistsContainer');
    if (!playlistsContainer) {
        console.error('Playlists container not found.');
        return;
    }

    // Clear the playlist container and show a placeholder message
    // playlistsContainer.innerHTML = '<p>No playlists available. Please log in to view your playlists.</p>';
}

function updatePlaylistContainer(message = '') {
    const playlistsContainer = document.getElementById('playlistsContainer');
    if (!playlistsContainer) {
        console.error('Playlists container not found.');
        return;
    }

    playlistsContainer.innerHTML = message ? `<p>${message}</p>` : ''; // Update the container with a message or clear it
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
            // loggedInUser = null;
            localStorage.removeItem('loggedInUser'); // Remove from localStorage
            showPopupMessage('You have logged out!', 'green');
            updatePlaylistContainer('No playlists available. Please log in to view your playlists.');

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

function fetchAndRenderPlaylists(username) {
    const playlistsContainer = document.getElementById('playlistsContainer');
    if (!playlistsContainer) {
        console.error('Playlists container not found.');
        return;
    }

    // Show loading state
    updatePlaylistContainer('Loading playlists...');

    // Simulate fetching playlists (you can replace this with an actual API call if needed)
    setTimeout(() => {
        const customPlaylists = JSON.parse(localStorage.getItem('customPlaylists')) || {};

        // Filter playlists by username if needed (adjust logic as per your data structure)
        const playlistsArray = Object.keys(customPlaylists).map((name) => ({
            name,
            songs: customPlaylists[name],
        }));

        if (playlistsArray.length === 0) {
            updatePlaylistContainer('No playlists available. Create one to get started!');
        } else {
            renderPlaylists(playlistsArray);
        }
    }, 500); // Simulate a delay for fetching
}



async function signup(username, password) {
    try {
        const response = await fetch('http://localhost:5000/signup', {
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
        const response = await fetch('http://localhost:5000/login', {
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

// Save custom playlists in localStorage
// function savePlaylist(playlistName, selectedSongs) {
//     const customPlaylists = JSON.parse(localStorage.getItem("customPlaylists")) || {};
//     customPlaylists[playlistName] = selectedSongs;
//     localStorage.setItem("customPlaylists", JSON.stringify(customPlaylists));
//     renderPlaylists();
// }

async function savePlaylist(name, songs = []) {
    const username = localStorage.getItem('username'); // Retrieve the logged-in username

    if (!username) {
        alert('Please log in to save your playlist.');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/playlists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, name, songs }),
        });

        if (response.ok) {
            alert('Playlist saved successfully!');
        } else {
            const error = await response.json();
            console.error('Failed to save playlist:', error.message);
            alert('Failed to save playlist.');
        }
    } catch (error) {
        console.error('Error saving playlist:', error);
        alert('An error occurred while saving the playlist.');
    }
}




// Render saved playlists as buttons
// function renderPlaylists() {
//     const container = document.getElementById('playlistsContainer');
//     if (!container) {
//         console.error("playlistsContainer not found in the DOM.");
//         return;
//     }
//     container.innerHTML = ""; // Clear existing buttons

//     const customPlaylists = JSON.parse(localStorage.getItem("customPlaylists")) || {};
//     Object.keys(customPlaylists).forEach(playlistName => {
//         const button = document.createElement('button');
//         button.textContent = playlistName;
//         button.classList.add('playlist-button');
//         button.onclick = () => viewPlaylist(playlistName);
//         container.appendChild(button);
//     });
// }







function initializeSeekbarAndVolume() {
    const playbar = document.querySelector(".playbar");
    const seekbar = playbar.querySelector(".seekbar");
    const circle = seekbar.querySelector(".circle");
    const volumeInput = playbar.querySelector(".volume input[type='range']");
    const songTime = playbar.querySelector(".songtime");

    // Seekbar updates
    currentsong.addEventListener("timeupdate", () => {
        const currentTime = currentsong.currentTime || 0;
        const duration = currentsong.duration || 0;

        // Update seekbar position and time display
        const progress = (currentTime / duration) * 100 || 0;
        circle.style.left = `${progress}%`;

        songTime.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
    });

    // Handle seekbar click
    seekbar.addEventListener("click", (e) => {
        const seekbarWidth = seekbar.getBoundingClientRect().width;
        const clickX = e.offsetX;

        const newTime = (clickX / seekbarWidth) * currentsong.duration;
        currentsong.currentTime = newTime;
    });

    // Volume control
    volumeInput.addEventListener("input", (e) => {
        const volume = parseInt(e.target.value, 10) / 100;
        currentsong.volume = volume;
    });

    // Handle mute/unmute
    const volumeImg = playbar.querySelector(".volumeimg");
    volumeImg.onclick = () => {
        currentsong.muted = !currentsong.muted;
        volumeImg.src = currentsong.muted ? "mute.svg" : "volume.svg";
    };
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}



function playSongFromPlaylist(playlistName, songIndex) {
    const customPlaylists = JSON.parse(localStorage.getItem("customPlaylists")) || {};
    const songs = customPlaylists[playlistName];

    if (!songs || songIndex < 0 || songIndex >= songs.length) {
        showPopupMessage("Invalid song selection!", "red");
        return;
    }

    const selectedSong = songs[songIndex];
    currentsong.src = `/songs/${selectedSong}`;
    currentsong.play();

    // Update playbar
    const playbar = document.querySelector(".playbar");
    if (playbar) {
        // Update song info
        const songInfo = playbar.querySelector(".songinfo");
        const songName = selectedSong.split("/").pop().replace(/\.mp3|\.wav|\.ogg|\.flac/i, "").replaceAll("%20", " ");
        songInfo.innerHTML = `<div>${songName}</div>`;

        // Play/Pause button logic
        const playButton = playbar.querySelector("#play");
        playButton.src = "pause.svg"; // Start with "Pause" icon
        // playButton.onclick = null; // Clear existing listener
        playButton.onclick = () => {
            // console.log("Play/Pause button clicked:", currentsong.paused ? "Paused" : "Playing");
            if (currentsong.paused) {
                currentsong.pause();
                playButton.src = "play.svg";
            } else {
                currentsong.play();
                playButton.src = "pause.svg";

            }
        };

        // Previous and Next buttons
        const prevButton = playbar.querySelector("#previous");
        const nextButton = playbar.querySelector("#next");

        prevButton.onclick = () => previousSong(playlistName, songIndex);
        nextButton.onclick = () => nextSong(playlistName, songIndex);

        // Reset and attach seekbar and volume controls
        initializeSeekbarAndVolume();
    }

    showPopupMessage(`Now playing: ${selectedSong.replaceAll("%20", " ")}`, "blue");
}

function displayAudioContent(audioFileName, audioPath) {
    const rightContainer = document.querySelector(".right .spotify-playlist");

    if (!rightContainer) {
        console.error("Right container not found in the DOM.");
        return;
    }

    // Replace the content
    rightContainer.innerHTML = `
        <h1>Audio Recording</h1>
        <div class="audio-content">
            <p><strong>File Name:</strong> ${audioFileName}</p>
            <audio controls>
                <source src="${audioPath}" type="audio/wav">
                Your browser does not support the audio element.
            </audio>
        </div>
    `;
}



function renderAudioList(recordings) {
    const audioListContainer = document.getElementById("audioListContainer");
    if (!audioListContainer) {
        console.error("Audio list container not found in the DOM.");
        return;
    }

    // Clear existing content
    audioListContainer.innerHTML = "";

    if (recordings.length === 0) {
        audioListContainer.innerHTML = `
            <div class="empty-message">No recordings available.</div>
        `;
        return;
    }

    // Populate recordings
    recordings.forEach((recording) => {
        const audioItem = document.createElement("div");
        audioItem.classList.add("audio-item");
        audioItem.textContent = recording;
        audioItem.dataset.audioPath = `/recordings/${recording}`;
        audioItem.addEventListener("click", () => {
            displayAudioContent(recording, audioItem.dataset.audioPath);
        });
        audioListContainer.appendChild(audioItem);
    });
}




async function fetchAudioRecordings() {
    try {
        const response = await fetch("/recordings");
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const recordings = await response.json();

        if (recordings.length === 0) {
            console.warn("No recordings found.");
            showPopupMessage("No recordings available.", "yellow");
            return;
        }

        renderAudioList(recordings);
    } catch (error) {
        console.error("Error fetching recordings:", error);
        showPopupMessage("Failed to load audio recordings. Check your server setup.", "red");
    }
}


// Call the function when the page loads
// document.addEventListener("DOMContentLoaded", fetchAudioRecordings);


function viewPlaylist(playlistName) {
    const customPlaylists = JSON.parse(localStorage.getItem("customPlaylists")) || {};
    const songs = customPlaylists[playlistName];

    if (!songs) {
        showPopupMessage("Playlist not found!", "red");
        return;
    }

    const rightContainer = document.querySelector(".right .spotify-playlist");
    if (!rightContainer) {
        console.error("Right container not found in the DOM.");
        return;
    }

    // Clear the existing content and display the playlist songs with buttons
    rightContainer.innerHTML = `
        <h1>${playlistName}</h1>
        <ul class="playlist-songs">
            ${songs
                .map(
                    (song) => `
                    <li class="playlist-song">
                        ${song}
                    </li>`
                )
                .join("")}
        </ul>
        <div class="playlist-actions">
            <button class="delete-playlist" onclick="deletePlaylist('${playlistName}')">Delete Playlist</button>
            <button class="rename-playlist" onclick="renamePlaylist('${playlistName}')">Rename Playlist</button>
        </div>
    `;
}


function deletePlaylist(playlistName) {
    if (confirm(`Are you sure you want to delete the playlist: ${playlistName}?`)) {
        const customPlaylists = JSON.parse(localStorage.getItem("customPlaylists")) || {};
        delete customPlaylists[playlistName]; // Remove playlist
        localStorage.setItem("customPlaylists", JSON.stringify(customPlaylists)); // Save changes
        showPopupMessage("Playlist deleted successfully!", "green");
        document.querySelector('.modal').remove(); // Close modal
        renderPlaylists(); // Refresh playlist buttons
    }
}

function renamePlaylist(oldName) {
    const newName = prompt("Enter the new name for your playlist:", oldName);
    if (newName && newName.trim() !== "") {
        const customPlaylists = JSON.parse(localStorage.getItem("customPlaylists")) || {};

        // Check if the new name already exists
        if (customPlaylists[newName]) {
            showPopupMessage("A playlist with this name already exists. Please choose another name.", "red");
            return;
        }

        // Rename the playlist
        customPlaylists[newName] = customPlaylists[oldName];
        delete customPlaylists[oldName]; // Remove the old entry
        localStorage.setItem("customPlaylists", JSON.stringify(customPlaylists)); // Save changes
        showPopupMessage("Playlist renamed successfully!", "green");
        document.querySelector('.modal').remove(); // Close modal
        renderPlaylists(); // Refresh playlist buttons
    } else {
        showPopupMessage("Invalid playlist name. Rename canceled.", "red");
    }
}






// Save Playlist and Close Modal
function saveCustomPlaylist(songList, modala) {
    const loggedInUser = localStorage.getItem("loggedInUser");

    // Check if user is logged in
    if (!loggedInUser) {
        // showPopupMessage("No playlists available. Please log in to view your playlists.", "red");
        return; // Exit the function if not logged in
    }

    const selectedSongs = Array.from(songList.querySelectorAll("input[type='checkbox']:checked"))
        .map(checkbox => checkbox.value);

    if (selectedSongs.length === 0) {
        showPopupMessage("No songs selected. Please select songs to create a playlist.", "yellow");
        return;
    }

    const playlistName = prompt("Enter a name for your playlist:");
    if (playlistName) {
        const customPlaylists = JSON.parse(localStorage.getItem("customPlaylists")) || {};

        // Check if the playlist name already exists
        if (customPlaylists[playlistName]) {
            showPopupMessage("Playlist name already exists. Please choose a different name.", "red");
            return;
        }

        // Save the new playlist
        customPlaylists[playlistName] = selectedSongs;
        localStorage.setItem("customPlaylists", JSON.stringify(customPlaylists));
        console.log("Saved Playlists:", customPlaylists);

        const playlistsArray = Object.keys(customPlaylists).map((name) => ({
            name,
            songs: customPlaylists[name],
        }));

        renderPlaylists(playlistsArray);
        showPopupMessage("Playlist created successfully!", "green");
        modala.remove();
    }
}



function playPlaylist(playlistName) {
    const customPlaylists = JSON.parse(localStorage.getItem("customPlaylists")) || {};
    const songs = customPlaylists[playlistName];

    if (!songs || songs.length === 0) {
        showPopupMessage("This playlist is empty!", "yellow");
        return;
    }

    let currentIndex = 0;

    const playNextSong = () => {
        if (currentIndex >= songs.length) {
            showPopupMessage("Playlist finished playing!", "green");
            return;
        }

        const currentSong = songs[currentIndex];
        currentsong.src = `/songs/${currentSong}`;
        currentsong.play();
        showPopupMessage(`Now playing: ${currentSong}`, "blue");

        currentsong.onended = () => {
            currentIndex++;
            playNextSong();
        };
    };

    playNextSong();
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
    }, 5000);
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
    console.log("Playing track from path:", currentsong.src); // Debug path


    // if (!pause) {
    //     currentsong.play();
    //     play.src = "pause.svg"
    // }

    if (!pause) {
        currentsong.play()
            .then(() => {
                play.src = "pause.svg";
                // console.log("Audio is playing successfully.");
            })
        // .catch(error => {
        //     console.warn("Audio play error:", error);

        //     // Suppress popup for non-critical autoplay issues
        //     if (error.name === "NotAllowedError" || error.name === "NotSupportedError") {
        //         console.warn("Autoplay restriction or minor issue: ", error.message);
        //     } else {
        //         showPopupMessage("Error playing audio. Please try again", "red");
        //     }
        // });
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
document.getElementById('inputfolder').addEventListener('click', function () {
    this.focus();
});


function renderPlaylists(playlists) {
    const playlistsContainer = document.getElementById('playlistsContainer');

    if (!playlistsContainer) {
        console.error('Playlists container not found.');
        return;
    }

    playlistsContainer.innerHTML = ''; // Clear existing playlists

    playlists.forEach((playlist) => {
        const button = document.createElement('button');
        button.classList.add('playlist-button');
        button.textContent = playlist.name;
        button.onclick = () => viewPlaylist(playlist.name); // Call viewPlaylist on click
        playlistsContainer.appendChild(button);
    });
}





document.addEventListener('DOMContentLoaded', async () => {
    // Selectors
    const audioListButton = document.querySelector('.record a');
    const recordingInterface = document.querySelector('.recording-interface');
    const playlistInterface = document.querySelector('.spotify-playlist');
    const startRecordingButton = document.getElementById('startRecording');
    const stopRecordingButton = document.getElementById('stopRecording');
    const saveRecordingButton = document.getElementById('saveRecording');
    const audioPreview = document.getElementById('audioPreview');
    const username = localStorage.getItem('username'); // Retrieve logged-in username
    const loggedInUser = localStorage.getItem('loggedInUser');




    if (!loggedInUser) {
        updatePlaylistContainer('No playlists available. Please log in to view your playlists.');
        return;
    } else {
        fetchAndRenderPlaylists(loggedInUser); // Render playlists if a user is logged in
    }

    const customPlaylists = JSON.parse(localStorage.getItem("customPlaylists")) || {};
    const playlistsArray = Object.keys(customPlaylists).map((name) => ({
        name,
        songs: customPlaylists[name],
    }));

    renderPlaylists(playlistsArray);


    // Initialize Login Button
    const loginButton = document.querySelector('.login');
    if (loginButton) {
        loginButton.addEventListener('click', function () {
            const loginPage = document.querySelector('.loginpage');
            if (loginPage) {
                const usernameInput = document.getElementById('username'); // Replace with actual input field ID
                const username = usernameInput ? usernameInput.value.trim() : null;

                if (username) {
                    localStorage.setItem('loggedInUser', username); // Store the username
                    alert(`You are now logged in as ${username}!`);

                    // Dynamically fetch and render playlists after login
                    fetchAndRenderPlaylists(username);
                } else {
                    alert('Please enter a valid username.');
                }

                loginPage.style.zIndex = "1000";
            } else {
                console.warn("Login page not found.");
            }
        });
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
                console.warn("Signup page not found.");
            }
        });
    }

    // Fetch and Render Playlists
    if (username) {
        try {
            const response = await fetch(`http://localhost:5000/api/playlists/${username}`);
            const data = await response.json();

            if (response.ok) {
                renderPlaylists(data.playlists);
            } else {
                console.error('Failed to fetch playlists:', data.message);
            }
        } catch (error) {
            console.error('Error fetching playlists:', error);
        }
    }

    // Toggle visibility of the recording interface
    if (audioListButton) {
        audioListButton.addEventListener('click', () => {
            const isHidden = recordingInterface.style.display === 'none';
            recordingInterface.style.display = isHidden ? 'block' : 'none';
            playlistInterface.style.display = isHidden ? 'none' : 'block';
        });
    }

    // Media Recording Logic
    let mediaRecorder;
    let audioChunks = [];

    if (startRecordingButton) {
        startRecordingButton.addEventListener('click', async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];

                mediaRecorder.ondataavailable = (event) => {
                    audioChunks.push(event.data);
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    const audioUrl = URL.createObjectURL(audioBlob);

                    audioPreview.src = audioUrl;
                    audioPreview.style.display = 'block';
                    saveRecordingButton.disabled = false;

                    saveRecordingButton.onclick = () => saveRecording(audioBlob);
                };

                mediaRecorder.start();
                startRecordingButton.disabled = true;
                stopRecordingButton.disabled = false;
            } catch (error) {
                console.error('Error starting recording:', error);
            }
        });
    }

    if (stopRecordingButton) {
        stopRecordingButton.addEventListener('click', () => {
            if (mediaRecorder) {
                mediaRecorder.stop();
            }
            startRecordingButton.disabled = false;
            stopRecordingButton.disabled = true;
        });
    }

    // Save Recording Function
    async function saveRecording(audioBlob) {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.wav');

        try {
            const response = await fetch('http://localhost:5000/save-audio', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                alert('Recording saved successfully!');
            } else {
                alert('Failed to save recording.');
                console.error(await response.text());
            }
        } catch (error) {
            console.error('Error saving recording:', error);
        }
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

    const audioButton = document.querySelector('.left ul .record a');

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
        // document.querySelector('.record-button').classList.remove('recording');
        audioButton.classList.remove('recording');
    }
}

function togglePlayPause(playButton) {
    if (currentsong.paused) {
        currentsong.play();
        playButton.src = "pause.svg";
    } else {
        currentsong.pause();
        playButton.src = "play.svg";
    }
}

function previousSong(playlistName, currentIndex) {
    const customPlaylists = JSON.parse(localStorage.getItem("customPlaylists")) || {};
    const songs = customPlaylists[playlistName];

    if (currentIndex > 0) {
        playSongFromPlaylist(playlistName, currentIndex - 1);
    } else {
        playSongFromPlaylist(playlistName, songs.length - 1); // Loop to the last song
    }
}

function nextSong(playlistName, currentIndex) {
    const customPlaylists = JSON.parse(localStorage.getItem("customPlaylists")) || {};
    const songs = customPlaylists[playlistName];

    if (currentIndex < songs.length - 1) {
        playSongFromPlaylist(playlistName, currentIndex + 1);
    } else {
        playSongFromPlaylist(playlistName, 0); // Loop to the first song
    }
}

function toggleMute() {
    const muteUnmuteIcon = document.getElementById("muteUnmuteIcon");

    if (currentsong.muted) {
        currentsong.muted = false;
        muteUnmuteIcon.src = "volume.svg";
    } else {
        currentsong.muted = true;
        muteUnmuteIcon.src = "mute.svg";
    }
}

function attachPlaybarEventListeners() {
    const seekbar = document.getElementById("seekbar");
    const volumeControl = document.getElementById("volumeControl");
    const currentTimeSpan = document.getElementById("currentTime");
    const totalTimeSpan = document.getElementById("totalTime");

    // Seekbar control
    seekbar.addEventListener("input", () => {
        const seekTime = (seekbar.value / 100) * currentsong.duration;
        currentsong.currentTime = seekTime;
    });

    // Volume control
    volumeControl.addEventListener("input", () => {
        currentsong.volume = volumeControl.value / 100;
    });

    // Update current time and seekbar
    currentsong.addEventListener("timeupdate", () => {
        const currentTime = formatTime(currentsong.currentTime);
        const totalTime = formatTime(currentsong.duration || 0);
        currentTimeSpan.textContent = currentTime;
        totalTimeSpan.textContent = totalTime;

        const progress = (currentsong.currentTime / currentsong.duration) * 100;
        seekbar.value = progress || 0;
    });
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

    // document.addEventListener('DOMContentLoaded', () => {
    //     // Initialize Login Button
    //     const loginButton = document.querySelector('.login');
    //     if (loginButton) {
    //         loginButton.addEventListener('click', function () {
    //             const loginPage = document.querySelector('.loginpage');
    //             if (loginPage) {
    //                 loginPage.style.zIndex = "1000";
    //                 localStorage.setItem('userLoggedIn', "true");
    //                 alert("You are now logged in!");
    //             } else {
    //                 console.error("Login page not found.");
    //             }
    //         });
    //     } else {
    //         console.error("Login button not found in the DOM.");
    //     }

    //     // Initialize Signup Button
    //     const signupButton = document.querySelector('.signup');
    //     if (signupButton) {
    //         signupButton.addEventListener('click', function () {
    //             const signupPage = document.querySelector('.signuppage');
    //             if (signupPage) {
    //                 signupPage.style.zIndex = "1000";
    //                 togglesignup(); // Assuming this function handles signup modal behavior
    //             } else {
    //                 console.error("Signup page not found.");
    //             }
    //         });
    //     } else {
    //         console.error("Signup button not found in the DOM.");
    //     }
    // });

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
    // currentsong.addEventListener("error", (e) => {
    //     console.error("Audio error:", e);
    //     showPopupMessage('Error playing audio. Please try again.', 'red');
    // });

    // initializeAudioControls();

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

    document.querySelector('.recording-panel').appendChild(recordButton);
}
main();

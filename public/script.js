let songs = [];
let currentSong = new Audio();
let currentFolder = '';
let currentSongIndex = 0;

function secondsToMinutes(seconds) {
    seconds = Math.floor(seconds);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

async function getSongs(folder) {
    currentFolder = folder;
    try {
        const response = await fetch(`/api/songs/folder/${folder}`);
        songs = await response.json();
        
        let songUL = document.querySelector(".songlist ul");
        songUL.innerHTML = "";
        
        songs.forEach((song, index) => {
            songUL.innerHTML += `
                <li>
                    <img class="invert" src="images/music.svg" alt="musicimg">
                    <div class="info">
                        <div>${song.title}</div>
                        <div>${song.artist}</div>
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                        <img class="invert" src="images/play.svg" alt="play">
                    </div>
                </li>`;
        });

        Array.from(songUL.getElementsByTagName("li")).forEach((e, index) => {
            e.addEventListener("click", () => {
                currentSongIndex = index;
                playMusic(songs[index]);
            });
        });
    } catch (error) {
        console.error('Error fetching songs:', error);
    }
}

const playMusic = (song, pause = false) => {
    currentSong.src = song.audioFile;
    if (!pause) {
        currentSong.play();
        play.src = "images/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = song.title;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    try {
        const response = await fetch('/api/songs');
        const allSongs = await response.json();
        
        // Group songs by folder
        const folders = [...new Set(allSongs.map(song => song.folder))];
        const cardContainer = document.querySelector(".cardContainer");
        cardContainer.innerHTML = '';

        for (const folder of folders) {
            const folderSongs = allSongs.filter(song => song.folder === folder);
            if (folderSongs.length > 0) {
                const firstSong = folderSongs[0];
                cardContainer.innerHTML += `
                    <div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
                                <circle cx="24" cy="24" r="24" fill="#1DB954" />
                                <polygon points="18,14 34,24 18,34" fill="black" />
                            </svg>
                        </div>
                        <img src="${firstSong.coverImage}" alt="cover image">
                        <h2>${folder}</h2>
                        <p>${folderSongs.length} songs</p>
                    </div>`;
            }
        }
    } catch (error) {
        console.error('Error displaying albums:', error);
    }
}

async function main() {
    await getSongs("ncs");
    if (songs.length > 0) {
        currentSongIndex = 0;
        playMusic(songs[0], true);
    }

    displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "images/pause.svg";
        } else {
            currentSong.pause();
            play.src = "images/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = 
            `${secondsToMinutes(currentSong.currentTime)} / ${secondsToMinutes(currentSong.duration)}`;
        document.querySelector(".circle").style.left = 
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", () => {
        if (currentSongIndex > 0) {
            currentSongIndex--;
            playMusic(songs[currentSongIndex]);
        }
    });

    next.addEventListener("click", () => {
        if (currentSongIndex < songs.length - 1) {
            currentSongIndex++;
            playMusic(songs[currentSongIndex]);
        }
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    document.querySelector(".cardContainer").addEventListener("click", async (e) => {
        let card = e.target.closest(".card");
        if (card) {
            await getSongs(card.dataset.folder);
            currentSongIndex = 0;
            if (songs.length > 0) {
                playMusic(songs[0]);
            }
        }
    });
}

main(); 
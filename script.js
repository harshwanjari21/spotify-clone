let songs;
let currFolder;

function secondsToMinutes(seconds) {
    seconds = Math.floor(seconds);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

async function getsongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${currFolder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currFolder}/`)[1]);
        }
    }

    let songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `
        <li>
            <img class="invert" src="images/music.svg" alt="musicimg">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Harsh</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="images/play.svg" alt="play">
            </div>
        </li>`;
    }

    Array.from(songUL.getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });
}

let currentsong = new Audio();

const playmusic = (track, pause = false) => {
    currentsong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentsong.play();
        play.src = "images/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    let res = await fetch(`http://127.0.0.1:3000/songs/`);
    let responseText = await res.text();

    let div = document.createElement("div");
    div.innerHTML = responseText;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    Array.from(anchors).forEach(async (e) => {
        let url = new URL(e.href);
        let pathname = url.pathname;

        let folder = pathname.split("/songs/")[1]?.replace("/", "").replaceAll("\\", "");

        if (!folder || folder.includes(".") || folder === "") return;

        try {
            let metaRes = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            if (!metaRes.ok) throw new Error("Missing info.json");

            let meta = await metaRes.json();

            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
                            <circle cx="24" cy="24" r="24" fill="#1DB954" />
                            <polygon points="18,14 34,24 18,34" fill="black" />
                        </svg>
                    </div>
                    <img src="/songs/${folder}/cover.jpg" alt="cover image">
                    <h2>${meta.title}</h2>
                    <p>${meta.description}</p>
                </div>`;
        } catch (err) {
            console.warn(`info.json not found or invalid for folder: ${folder}`);
        }
    });
}


async function main() {
    await getsongs("songs/ncs"); 
    playmusic(songs[0], true);    

    displayAlbums();

    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "images/pause.svg";
        } else {
            currentsong.pause();
            play.src = "images/play.svg";
        }
    });

    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutes(currentsong.currentTime)} / ${secondsToMinutes(currentsong.duration)}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = (currentsong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").pop());
        if (index > 0) playmusic(songs[index - 1]);
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").pop());
        if (index < songs.length - 1) playmusic(songs[index + 1]);
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100;
    });

    document.querySelector(".cardContainer").addEventListener("click", async (e) => {
        let card = e.target.closest(".card");
        if (card) {
            await getsongs(`songs/${card.dataset.folder}`);
            playmusic(songs[0]);
        }
    });
}

main();
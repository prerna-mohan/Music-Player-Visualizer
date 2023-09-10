'use strict';
import './style.css'
import * as helper from './helper';
import * as Router from './Router/router'
import * as Route from './Router/route'
import * as SpotifyApi from '../node_modules/spotify-web-api-js'
import Q, { reject, resolve } from 'q';


(async function () {
    let searchResults = null;


    const debounceFunc = (func, delay) => {
        let timer;
         return function(...args) {
            const context = this;
            clearTimeout(timer);
            timer = setTimeout(() => {
                func.apply(context, args);
            }, delay)
          }
     }

    const optimisedSearchHandler = debounceFunc(searchHandler, 500)


    const selectionHeader = document.querySelector('.selectionHeader').childNodes;
    selectionHeader.forEach((chipItem) => {
        chipItem.addEventListener('click',(e) => {
            console.log('event..',e);
            const selectedChip = document.querySelector('.selected');
            selectedChip.classList.remove('selected');
            const selectedContainer = document.querySelector(`.${selectedChip.classList[0].split('_')[0]}`);
            selectedContainer.style.display = 'none';

            e.target.classList.add('selected');
            const newContainer = document.querySelector(`.${e.target.classList[0].split('_')[0]}`);
            newContainer.style.display = (e.target.classList[0].split('_')[0] == 'container')? 'grid' : 'flex';
        })
    });
    
    const searchResultSection = document.querySelector('.search_result');
    const clientID = '29fb243408904836b4351bd376d0c1e3';
    const secret = 'c1d65d1bcc324b9f9ec19d671881283c';
    const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + window.btoa(clientID + ':' + secret)
        },
        body: 'grant_type=client_credentials'
    }
    );
    const data = await res.json();

    var spotifyApi = new SpotifyApi();
    let searchData = '';
    spotifyApi.setAccessToken(data.access_token);
    spotifyApi.setPromiseImplementation(Q);


    const searchInput = document.querySelector('.searchbox');

    searchInput.addEventListener('keyup', optimisedSearchHandler);

    async function searchHandler(e)
    {
        console.log('handle!!!!')
        searchResultSection.style.visibility = 'visible';
        if (!e.target.value) {
            searchResultSection.style.visibility = 'hidden';
            return;
        }
        else
            searchData = e.target.value;

        console.log('fired.. ', searchData);
        const promises = [
            spotifyApi.searchTracks(searchData),
            spotifyApi.searchArtists(searchData),
            spotifyApi.searchAlbums(searchData)
        ]

        Promise.allSettled(promises).then(res => {
            const tracks = res[0].value;
            const artists = res[1].value;
            const albums = res[2].value;
            setAll(artists.artists.items.slice(0,4), tracks.tracks.items.slice(0,4), albums.albums.items.slice(0,4));
            // setSongs(tracks);
            setArtists(artists.artists.items);
            setAlbums(albums.albums.items);
        },err => {console.log("An error occured.. ", err)}).then(() => {console.log('loaded!!....')});
    }

    const setSongs = async(tracks) => {
        
    }

    const setArtists = async(artists) => {
        const artistContainer = document.querySelector('.artistContainer');
        artistContainer.innerHTML = '';
        const fragment = document.createDocumentFragment();
        
        artists.forEach((artist) => {
            const div = document.createElement('div');
            div.classList.add('artists');
            const img = document.createElement('img');
            img.src = (artist.images.length) ? artist.images[1].url : '';
            div.appendChild(img);
            fragment.appendChild(div);
        });
        artistContainer.appendChild(fragment);
    }
    
    const setAlbums = async(albums) => {
        const albumContainer = document.querySelector('.albumContainer');
        albumContainer.innerHTML = '';
        const fragment = document.createDocumentFragment();
        
        albums.forEach((album) => {
            const div = document.createElement('div');
            div.classList.add('albums');
            const img = document.createElement('img');
            img.src = (album.images.length) ? album.images[1].url : '';
            div.appendChild(img);
            fragment.appendChild(div);
        });
        albumContainer.appendChild(fragment);
    }

    const setAll = async (artistData, trackData, albumData) => {
        // console.log('calling setall ',albumData);

        let artistImg = document.getElementById('artistImg');
        artistImg.src = (artistData[0].images.length) ? artistData[0].images[1].url : '';
        let artistName = document.getElementById('artistName');
        artistName.innerText = artistData[0].name;

        trackData.forEach((track, index) => {
            let i = index+1;
            const songImg = document.getElementById(`simg${i}`);
            songImg.src = (track.album.images.length) ? track.album.images[2].url : '';
            const songTrack = document.getElementById(`strack${i}`);
            songTrack.innerText = track.name;
            const songAlbum = document.getElementById(`salbum${i}`);
            songAlbum.innerText = track.album.name;
            const songDuration = document.getElementById(`sduration${i}`);
            songDuration.innerText = millisToMinutesAndSeconds(track.duration_ms);
        });
        artistData.forEach((artist, index) => {
            let i = index+1;
            artistImg = document.getElementById(`artistImg${i}`);
            artistName = document.getElementById(`artistname${i}`);
            artistName.innerText = artist.name;
            artistImg.src = (artist.images.length) ? artist.images[1].url : '';
        });
        albumData.forEach((album, index) => {
            let i = index+1;
            const albumImg = document.getElementById(`albumImg${i}`);
            const albumname = document.getElementById(`albumname${i}`);
            albumname.innerText = album.name;
            albumImg.src = (album.images.length) ? album.images[1].url : '';
        });
        // console.log('done setall');
    }

    const artistsInfoString = (artists) => {

    }
    const millisToMinutesAndSeconds = (millis) => {
        var minutes = Math.floor(millis / 60000);
        var seconds = ((millis % 60000) / 1000).toFixed(0);
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
      }

    const carousel1 = document.querySelector('.carousel_1');
    const carousel2 = document.querySelector('.carousel_2');
    const carousel3 = document.querySelector('.carousel_3');
    const carousel4 = document.querySelector('.carousel_4');
    // const c2 = document.querySelectorAll('.c2');
    // const c3 = document.querySelectorAll('.c3');
    // const c1 = document.querySelectorAll('.c1');
    // const c4 = document.querySelectorAll('.carousel_4');
    let startTime = +(new Date()).getTime();
    let v = 1, i = 0;

    (async function updateCarousel() {
        let diff = (new Date()).getTime() - startTime;
        diff *= 0.05;

        carousel1.style.transform = `translateY(${100 - diff}px)`;
        carousel2.style.transform = `translateY(${diff}px)`;
        carousel3.style.transform = `translateY(${100 - diff}px)`;
        carousel4.style.transform = `translateY(${diff}px)`;
        requestAnimationFrame(updateCarousel)
    })();

    setInterval(() => {
        createUpCarouselElement((i++) % 3);
    }, 2000);

    const createUpCarouselElement = async (i) => {
        const newDivC1 = document.createElement('div');
        newDivC1.classList.add('c1');
        const newDivC3 = document.createElement('div');
        newDivC3.classList.add('c3');
        const newDivC2 = document.createElement('div');
        newDivC2.classList.add('c2');
        const newDivC4 = document.createElement('div');
        newDivC4.classList.add('c4');

        const imgItemC1 = document.createElement('img');
        imgItemC1.src = helper.images_C1[i];
        const imgItemC3 = document.createElement('img');
        imgItemC3.width = '175';
        imgItemC3.height = '215';
        imgItemC3.src = helper.images_C3[i];
        const imgItemC2 = document.createElement('img');
        imgItemC2.src = helper.images_C2[i];
        const imgItemC4 = document.createElement('img');
        imgItemC4.width = '400';
        imgItemC4.height = '215';
        imgItemC4.src = helper.images_C4[i];

        newDivC1.appendChild(imgItemC1);
        newDivC2.appendChild(imgItemC2);
        newDivC3.appendChild(imgItemC3);
        newDivC4.appendChild(imgItemC4);

        newDivC2.style.top = `-${340 * v}px`;
        newDivC4.style.top = `-${240 * v}px`; v++;
        newDivC2.style.position = newDivC4.style.position = 'absolute';

        carousel1.insertAdjacentElement('beforeend', newDivC1);
        carousel2.insertAdjacentElement('afterbegin', newDivC2);
        carousel3.insertAdjacentElement('beforeend', newDivC3);
        carousel4.insertAdjacentElement('afterbegin', newDivC4);
    }


    // function init() {
    //     console.log('this is spotify ',SpotifyApi)
    //     var router = new Router.Router([
    //         new Route.Route('home', 'home.html', true),            
    //         new Route.Route('about', 'about.html')
    //     ]);
    // }
    // init();

    // const options = {
    //     root:null,
    //     rootMargin:'-15px'
    // }
    // const caraouselObserver = new IntersectionObserver(function(entries, observer){
    //     console.log(entries[0]);
    //     if(!entries[0].isIntersecting){
    //         carousel1.insertAdjacentElement('beforeend',entries[0].target)
    //     }
    // });
    // caraouselObserver.observe(carouselElement);
    // carousel1Elements.forEach((item, index) => {
    //     caraouselObserver.observe(item)
    // })

    //--------------------------------------------------
    //     var _baseUri = 'https://api.spotify.com/v1';
    //     const clientID = '29fb243408904836b4351bd376d0c1e3';
    //     const secret = 'c1d65d1bcc324b9f9ec19d671881283c';

    //     const res = await fetch('https://accounts.spotify.com/api/token',{
    //             method:'POST',
    //             headers:{
    //                 'Content-Type':'application/x-www-form-urlencoded',
    //                 'Authorization':'Basic '+ btoa(clientID + ':'+secret)
    //             },
    //             body:'grant_type=client_credentials'
    //         }
    //         );
    //     const data = await res.json();
    //     console.log('this is token..... ',data);
    // //-------------------------------------------------------
    //     const res2 = await fetch(`${_baseUri}/browse/new-releases`,{
    //             method:'GET',
    //             headers:{
    //                 'Authorization':'Bearer '+ data.access_token
    //             }
    //         }
    //         );
    //     const data2 = await res2.json();
    //     console.log('this is new releases..... ',data2);
    // //--------------------------------------------------------
    // //-------------------------------------------------------
    // const categ = await fetch(`${_baseUri}/browse/categories`,{
    //     method:'GET',
    //     headers:{
    //         'Authorization':'Bearer '+ data.access_token
    //     }
    // }
    // );
    // const categor = await categ.json();
    // console.log('this is categories..... ',categor);
    // //--------------------------------------------------------
    //     const types = ["album",
    //     "artist",
    //     "playlist",
    //     "track",
    //     "show",
    //     "episode",
    //     "audiobook"];
    //     const params = new URLSearchParams({
    //         q: "say it right",
    //         type: types.join(',')
    //     });
    //     const search = await fetch(`${_baseUri}/search?${params}`,{
    //         method:'GET',
    //         headers:{
    //             'Authorization':'Bearer '+ data.access_token
    //         }
    //     }
    //     );
    //     const data3 = await search.json();
    //     console.log('this is search res..... ',data3);
    // //-----------------------------------------------------------
    // //-------------------------------------------------------
    // const genre = await fetch(`${_baseUri}/recommendations/available-genre-seeds`,{
    //     method:'GET',
    //     headers:{
    //         'Authorization':'Bearer '+ data.access_token
    //     }
    // }
    // );
    // const data4 = await genre.json();
    // console.log('this is genres..... ',data4);
    //--------------------------------------------------------
}());
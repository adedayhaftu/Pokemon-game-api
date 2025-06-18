const typeColors = {
      normal: "#A8A77A", fire: "#EE8130", water: "#6390F0", electric: "#F7D02C",
      grass: "#7AC74C", ice: "#96D9D6", fighting: "#C22E28", poison: "#A33EA1",
      ground: "#E2BF65", flying: "#A98FF3", psychic: "#F95587", bug: "#A6B91A",
      rock: "#B6A136", ghost: "#735797", dragon: "#6F35FC", dark: "#705746",
      steel: "#B7B7CE", fairy: "#D685AD",
    };
    const cardList = document.getElementById('card-list');
    const searchInput = document.getElementById('pokemon-search');
    const suggestions = document.getElementById('suggestions');
    const randomBtn = document.getElementById('random-pokemon');
    let pokemonList = [];
    let pokemonDataCache = {};
    function createParticles() {
      const particlesContainer = document.querySelector('.bg-particles');
      for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (Math.random() * 4 + 6) + 's';
        particlesContainer.appendChild(particle);
      }
    }
    createParticles();
    fetch('https://pokeapi.co/api/v2/pokemon?limit=10000')
      .then(response => response.json())
      .then(data => {
        pokemonList = data.results.map(pokemon => pokemon.name);
        showDefaultCards(["pikachu", "bulbasaur", "charmander", "squirtle", "gengar", "eevee"]);
      });
    function showDefaultCards(names) {
      cardList.innerHTML = '';
      names.forEach((name, index) => {
        setTimeout(() => addPokemonCard(name), index * 100);
      });
    }
    function addPokemonCard(name) {
      name = name.toLowerCase();
      if (document.getElementById(`poke-card-${name}`)) return;
      if (pokemonDataCache[name]) {
        renderCard(pokemonDataCache[name]);
        return;
      }
      fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
        .then(response => {
          if (!response.ok) throw new Error('Pokémon not found!');
          return response.json();
        })
        .then(data => {
          pokemonDataCache[name] = data;
          renderCard(data);
        })
        .catch(error => {
          console.error('Error fetching Pokémon:', error);
        });
    }

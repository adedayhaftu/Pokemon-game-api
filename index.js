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
      function renderCard(data) {
      const types = data.types.map(type => type.type.name);
      const img = data.sprites.front_default || '';
      const shinyImg = data.sprites.front_shiny || img;
      const name = data.name.toLowerCase();
      const card = document.createElement('div');
      card.className = 'flip-card';
      card.id = `poke-card-${name}`;
      card.innerHTML = `
        <div class="flip-card-inner">
          <div class="flip-card-front">
            <img src="${img}" alt="${data.name}" id="img-${name}">
            <h3>${data.name}</h3>
            <div>${types.map(type =>
              `<span class="type-badge" style="background:${typeColors[type] || '#aaa'}">${type}</span>`
            ).join(' ')}</div>
            <button class="flip-btn">See Details</button>
            <button class="shiny-btn" title="Toggle shiny appearance">✨</button>
          </div>
          <div class="flip-card-back" id="back-${name}">
            <div style="display: flex; justify-content: center; align-items: center; height: 100%; color: #64FFDA;">
              Loading details...
            </div>
          </div>
        </div>
      `;
      cardList.insertBefore(card, cardList.firstChild);
      let shinyMode = false;
      card.querySelector('.shiny-btn').onclick = (e) => {
        e.stopPropagation();
        shinyMode = !shinyMode;
        card.querySelector(`#img-${name}`).src = shinyMode ? shinyImg : img;
        const sparkles = document.createElement('div');
        sparkles.style.position = 'absolute';
        sparkles.style.top = '0';
        sparkles.style.left = '0';
        sparkles.style.width = '100%';
        sparkles.style.height = '100%';
        sparkles.style.pointerEvents = 'none';
        sparkles.innerHTML = ':sparkles:';
        sparkles.style.fontSize = '2em';
        sparkles.style.animation = 'sparkle 0.6s ease-out';
        card.querySelector('.flip-card-front').appendChild(sparkles);
        setTimeout(() => sparkles.remove(), 600);
      };
      card.querySelector('.flip-btn').onclick = () => {
        card.classList.add('flipped');
      };
   
      fetchTypeRelations(types).then(relationsList => {
        document.getElementById(`back-${name}`).innerHTML = `
          <div><strong>Types:</strong> ${types.map(type =>
            `<span class="type-badge" style="background:${typeColors[type] || '#aaa'}">${type}</span>`
          ).join(' ')}</div>
          <div class="abilities"><strong>Abilities:</strong> ${data.abilities.map(ability => ability.ability.name).join(', ')}</div>
          <div>
            <table class="stats-table">
              <thead>
                <tr><th>Stat</th><th>Value</th></tr>
              </thead>
              <tbody>
                ${data.stats.map(stat => `
                  <tr>
                    <td style="text-transform:capitalize">${stat.stat.name.replace('-', ' ')}</td>
                    <td>${stat.base_stat}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ${relationsList.map(rel => `
            <div class="type-rel">
              <strong>${rel.type.toUpperCase()} TYPE EFFECTIVENESS:</strong>
              <div><strong>Strong Against:</strong> ${rel.strong}</div>
              <div><strong>Weak Against:</strong> ${rel.weak}</div>
            </div>
          `).join('')}
          <button class="back-btn">← Back to Card</button>
        `;
        card.querySelector('.back-btn').onclick = (e) => {
          e.stopPropagation();
          card.classList.remove('flipped');
        };
      });
    }
    function fetchTypeRelations(types) {
      return Promise.all(types.map(type =>
        fetch(`https://pokeapi.co/api/v2/type/${type}`)
          .then(response => response.json())
          .then(data => ({
            type,
            strong: data.damage_relations.double_damage_to.map(t =>
              `<span class="type-badge" style="background:${typeColors[t.name] || '#aaa'}">${t.name}</span>`
            ).join(' ') || 'None',
            weak: data.damage_relations.double_damage_from.map(t =>
              `<span class="type-badge" style="background:${typeColors[t.name] || '#aaa'}">${t.name}</span>`
            ).join(' ') || 'None'
          }))
      ));
    }
    searchInput.addEventListener('input', function() {
      const query = this.value.toLowerCase();
      suggestions.innerHTML = '';
      if (!query) {
        suggestions.style.display = 'none';
        return;
      }
      const matches = pokemonList.filter(name => name.startsWith(query)).slice(0, 8);
      if (matches.length > 0) {
        suggestions.style.display = 'block';
        matches.forEach(name => {
          const div = document.createElement('div');
          div.textContent = name;
          div.classList.add('suggestion');
          div.onmousedown = () => {
            addPokemonCard(name);
            searchInput.value = '';
            suggestions.style.display = 'none';
          };
          suggestions.appendChild(div);
        });
      } else {
        suggestions.style.display = 'none';
      }
    });
    searchInput.addEventListener('blur', () => {
      setTimeout(() => suggestions.style.display = 'none', 200);
    });
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        const name = this.value.trim().toLowerCase();
        if (pokemonList.includes(name)) {
          addPokemonCard(name);
          this.value = '';
          suggestions.style.display = 'none';
        }
      }
    });
    randomBtn.addEventListener('click', () => {
      const randomPokemon = pokemonList[Math.floor(Math.random() * pokemonList.length)];
      addPokemonCard(randomPokemon);
      searchInput.value = '';
      suggestions.style.display = 'none';
    });
   
    const sparkleStyle = document.createElement('style');
    sparkleStyle.textContent = `
      @keyframes sparkle {
        0% { opacity: 0; transform: scale(0.5) rotate(0deg); }
        50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
        100% { opacity: 0; transform: scale(0.8) rotate(360deg); }
      }`;
    document.head.appendChild(sparkleStyle);

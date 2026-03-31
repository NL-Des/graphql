// Variable constantes
const urlSignin = "https://zone01normandie.org/api/auth/signin/";
const urlGraphQL = "https://zone01normandie.org/api/graphql-engine/v1/graphql";
let tokenJWT = ""

// Si le token de connexion est déjà enregistré dans le navigateur.
// Alors on va directement sur l'affichage
const savedToken = localStorage.getItem('jwt');
if (savedToken) {
    
}

async function orchestration (form) {
    const data = recoltLogin(form);
    const dataBase64 = translationInBase64(data.username, data.password);
    const credentialsToSend = await sendCredentials(dataBase64);

    if(credentialsToSend.ok) {
        tokenJWT = await credentialsToSend.json();
        // localStorage.setItemsert à stocker une donnée de manière permanente dans le navigateur.
        // jwt : JSONWebToken
        localStorage.setItem('jwt', tokenJWT);
        console.log("Connexion réussis, sauvegarde du token dans le navigateur");
        const dataFormat = formatRequest();
        const graphqlData = await downloadJSON(tokenJWT, dataFormat);
            if(graphqlData.ok) {
                const result = await graphqlData.json() // Transformation de la réponse en JSON
                console.log("Connexion avec le Token réussie. Récupération des données de GraphQL :", result.data)
            } else {
                console.log("Connexion avec le Token échouée.", graphqlData.status)
            }
        
    } else {
        console.log("Connexion échouée :", credentialsToSend.status)
    }
}

// Récupération du login
function recoltLogin(form) {
    const username = form.username.value;
    const password = form.password.value;
    return {username, password}
}

// Le login est traduis en Base64
function translationInBase64(username, password) {
    // Conversion des chaînes de caractères en base64
    // Afin de pouvoir les envoyer après au serveur.
    const credentials = window.btoa(`${username}:${password}`);
    return credentials
}

//
async function sendCredentials (credentials) {
    const connexion = await fetch(urlSignin, {
        method: 'POST',
        headers: {
            // Le Basic est le nom du schéma d'authendification.
            // Il attend le format suivant : "username:password", encodé en Bas64.
            // C'est pour le protocole d'authentification HTTP.
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json'
        }
    })
    return connexion
}

// Les Boutons
// Bouton Connexion
const form = document.getElementById('form');
    form.addEventListener('submit', function(event) {
        // Empêche le rechargement de la page (comportement par défaut du type="submit")
        // Ce qui nous évite de perdre les données si la page devait se recharger.
        event.preventDefault(); 
        
        // Appel de la fonction si l'utilisateur appuye sur le bouton.
        orchestration(form);
    });

// Bouton Déconnexion.
const formLogout = document.getElementById('logout-form')
    if(formLogout) {
        formLogout.addEventListener('submit', function(event) {
            event.preventDefault();
            localStorage.removeItem('jwt')
            window.location.href = '/base.html'
        }
    )
    }

// Téléchargement du JSON des données de l'API.
async function downloadJSON(tokenJWT, dataFormat) {
    const response = await fetch(urlGraphQL, {
        method: 'POST',
        headers: {
            // Le Bearer est pour renvoyer le token d'identiication plutôt
            // que de répéter le processus de connexion à chaque fois.
            'Authorization': `Bearer ${tokenJWT}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataFormat)
    });
    return response
}

// Pour obtenir la liste des éléments présents dans le JSON.
function formatRequest() {
    return {
        query: `
            query {
              __type(name: "user") {
                fields {
                  name
                  description
                  type {
                    name
                    kind
                  }
                }
              }
            }`
    };
}

// Requête query pour obtenir les données.
/* function formatRequest() {
    return {
        query: `
            query {
                user {
                    firstName
                    lastName
                    login
                    profile
                    public
                    objects
                    objects_aggregate
                    progresses
                    results
                    transactions
                    xps
                }
            }`
    };
} */
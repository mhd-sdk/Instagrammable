# Guide Pédagogique : TanStack Start Server Functions

## 🎯 Prompt pour Génération de Schéma Pédagogique

### Contexte
TanStack Start utilise des "Server Functions" qui permettent d'appeler du code serveur directement depuis le client, sans créer d'API REST traditionnelle.

### Objectif du Schéma
Créer un diagramme pédagogique qui explique visuellement :
1. Le flux de données entre client et serveur
2. Les différentes couches d'abstraction
3. Le rôle des middlewares et de la validation
4. La comparaison avec une approche API REST classique

---

## 📊 Schéma Architectural

```mermaid
graph TB
    %% Définition des styles
    classDef clientLayer fill:#e3f2fd,stroke:#1976d2,stroke-width:3px,color:#000
    classDef serverLayer fill:#fff3e0,stroke:#f57c00,stroke-width:3px,color:#000
    classDef dbLayer fill:#e8f5e9,stroke:#388e3c,stroke-width:3px,color:#000
    classDef magicLayer fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px,color:#000
    
    %% Client Side
    subgraph CLIENT["🖥️ CLIENT (Navigateur)"]
        A[Composant React]
        B[Hook personnalisé<br/>useEvents]
        C[TanStack Query<br/>Cache & État]
    end
    
    %% TanStack Magic
    D["✨ TANSTACK START<br/>Génère automatiquement<br/>les appels HTTP"]
    
    %% Server Side
    subgraph SERVER["⚙️ SERVEUR (Node.js)"]
        E[Server Function<br/>createEventFn]
        F[Middleware<br/>Authentification]
        G[Validation<br/>Zod Schema]
        H[Handler<br/>Logique métier]
        I[Data Access Layer<br/>createEvent]
    end
    
    %% Database
    J[(🗄️ PostgreSQL<br/>Base de données)]
    
    %% Connexions
    A -->|"appelle"| B
    B -->|"utilise"| C
    C -->|"appelle<br/>createEventFn()"| D
    D -.->|"HTTP POST<br/>(automatique)"| E
    E -->|"1️⃣ exécute d'abord"| F
    F -->|"2️⃣ puis valide"| G
    G -->|"3️⃣ enfin traite"| H
    H -->|"accède aux données"| I
    I -->|"SQL INSERT"| J
    J -.->|"résultat"| I
    I -.->|"retourne"| H
    H -.->|"résultat"| D
    D -.->|"JSON response<br/>(automatique)"| C
    C -.->|"met à jour"| A
    
    %% Styles
    class A,B,C clientLayer
    class E,F,G,H,I serverLayer
    class J dbLayer
    class D magicLayer
```

---

## 🔄 Comparaison : Ancien vs Nouveau Modèle

```mermaid
flowchart LR
    subgraph OLD["❌ APPROCHE CLASSIQUE (API REST)"]
        direction TB
        O1[Composant React]
        O2["fetch('/api/events')"]
        O3[Route Express<br/>app.post]
        O4[Controller]
        O5[Database]
        
        O1 --> O2
        O2 -.->|"HTTP POST<br/>manuel"| O3
        O3 --> O4
        O4 --> O5
    end
    
    subgraph NEW["✅ TANSTACK START"]
        direction TB
        N1[Composant React]
        N2["createEventFn()"]
        N3[✨ Magie TanStack]
        N4[Handler]
        N5[Database]
        
        N1 --> N2
        N2 --> N3
        N3 -.->|"HTTP géré<br/>automatiquement"| N4
        N4 --> N5
    end
    
    OLD -.->|"Migration"| NEW
    
    style OLD fill:#ffebee,stroke:#c62828
    style NEW fill:#e8f5e9,stroke:#2e7d32
```

---

## 🎓 Exemple Concret Annoté

```mermaid
sequenceDiagram
    participant U as 👤 Utilisateur
    participant C as 🖥️ Composant React
    participant T as ✨ TanStack
    participant M as 🔐 Middleware Auth
    participant V as ✅ Validator
    participant H as ⚙️ Handler
    participant DB as 🗄️ Database
    
    U->>C: Clique sur "Créer Événement"
    activate C
    
    Note over C: const result = await<br/>createEventFn({ data })
    
    C->>T: Appel createEventFn(data)
    activate T
    
    Note over T: Convertit en HTTP POST<br/>Sérialise les données
    
    T->>M: HTTP POST /fn/createEvent
    activate M
    
    Note over M: Vérifie session<br/>Extrait userId
    
    alt ❌ Non authentifié
        M-->>T: Error: No session
        T-->>C: Exception
        C-->>U: ❌ Erreur affichée
    else ✅ Authentifié
        M->>V: next({ userId })
        activate V
        
        Note over V: Valide avec Zod<br/>eventFormSchema
        
        alt ❌ Données invalides
            V-->>T: ValidationError
            T-->>C: Exception
            C-->>U: ❌ Erreur validation
        else ✅ Données valides
            V->>H: handler({ data, context })
            activate H
            
            Note over H: Génère UUID<br/>Prépare données
            
            H->>DB: INSERT INTO events
            activate DB
            DB-->>H: Nouvel événement
            deactivate DB
            
            H-->>V: return newEvent
            deactivate H
            V-->>M: return newEvent
            deactivate V
            M-->>T: return newEvent
            deactivate M
            
            Note over T: Sérialise JSON<br/>Envoie réponse
            
            T-->>C: ✅ newEvent
            deactivate T
            C-->>U: ✅ "Événement créé !"
            deactivate C
        end
    end
```

---

## 🏗️ Architecture en Couches du Projet

```mermaid
graph TD
    subgraph UI["🎨 COUCHE UI (Présentation)"]
        C1[src/components/<br/>EventForm.tsx]
        C2[src/components/<br/>EventList.tsx]
    end
    
    subgraph HOOKS["🪝 COUCHE HOOKS (Logique Réutilisable)"]
        H1[src/hooks/<br/>useEvents.ts]
        H2[src/hooks/<br/>useCreateEvent.ts]
    end
    
    subgraph QUERIES["💾 COUCHE QUERIES (Cache & État)"]
        Q1[src/queries/<br/>events.ts<br/>Query Options]
    end
    
    subgraph FUNCTIONS["⚡ COUCHE FUNCTIONS (API)"]
        F1[src/fn/<br/>events.ts<br/>Server Functions]
    end
    
    subgraph DATA["📊 COUCHE DATA ACCESS (SQL)"]
        D1[src/data-access/<br/>events.ts<br/>Requêtes DB]
    end
    
    subgraph DB["🗄️ BASE DE DONNÉES"]
        DB1[(PostgreSQL)]
    end
    
    C1 --> H1
    C2 --> H1
    H1 --> Q1
    H2 --> Q1
    Q1 --> F1
    F1 --> D1
    D1 --> DB1
    
    style UI fill:#e3f2fd
    style HOOKS fill:#f3e5f5
    style QUERIES fill:#fff3e0
    style FUNCTIONS fill:#ffebee
    style DATA fill:#e8f5e9
    style DB fill:#fce4ec
```

---

## 📝 Code Exemple Complet

### 1️⃣ Définition de la Server Function

```typescript
// src/fn/events.ts
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Schéma de validation
const eventFormSchema = z.object({
  title: z.string().min(1).max(200),
  startTime: z.string().datetime(),
});

// Server Function
export const createEventFn = createServerFn({
  method: "POST",  // 📌 Méthode HTTP
})
  .inputValidator(eventFormSchema)  // 📌 Validation Zod
  .middleware([authenticatedMiddleware])  // 📌 Sécurité
  .handler(async ({ data, context }) => {
    // 🔥 Code exécuté SUR LE SERVEUR
    const eventData = {
      id: crypto.randomUUID(),
      title: data.title,
      startTime: new Date(data.startTime),
      createdBy: context.userId,  // Fourni par le middleware
    };
    
    return await createEvent(eventData);
  });
```

### 2️⃣ Utilisation dans un Hook

```typescript
// src/hooks/useCreateEvent.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEventFn } from "~/fn/events";

export function useCreateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => createEventFn({ data }),
    onSuccess: () => {
      // Invalide le cache pour rafraîchir la liste
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
```

### 3️⃣ Utilisation dans un Composant

```typescript
// src/components/EventForm.tsx
import { useCreateEvent } from "~/hooks/useCreateEvent";

export function EventForm() {
  const createEvent = useCreateEvent();
  
  const handleSubmit = async (formData) => {
    try {
      // ✨ Appel simple, comme une fonction normale !
      await createEvent.mutateAsync({
        title: formData.title,
        startTime: formData.startTime,
      });
      
      toast.success("Événement créé !");
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## 🎯 Points Clés à Retenir

### ✅ Avantages des Server Functions

1. **Pas d'API REST explicite** : Plus besoin de définir des routes `/api/...`
2. **Type-safety end-to-end** : TypeScript du client au serveur
3. **Validation intégrée** : Avec Zod directement dans la fonction
4. **Sécurité par middleware** : Authentification/autorisation centralisée
5. **Code plus simple** : Moins de boilerplate

### 🔑 Concepts Importants

- **`createServerFn()`** : Crée une fonction qui s'exécute sur le serveur
- **`.inputValidator()`** : Valide les données entrantes
- **`.middleware()`** : Ajoute de la logique (auth, logs, etc.)
- **`.handler()`** : Contient la logique métier
- **`context`** : Données partagées entre middlewares et handler

### 📦 Organisation des Fichiers

```
src/
├── fn/              # Server Functions (logique serveur)
├── queries/         # TanStack Query options (cache)
├── hooks/           # Hooks React personnalisés
├── components/      # Composants UI
├── data-access/     # Requêtes SQL directes
└── db/             # Schéma et connexion DB
```

---

## 🎨 Prompt pour Générer un Schéma Similaire

**Prompt IA :**

> Crée un diagramme Mermaid expliquant l'architecture des Server Functions de TanStack Start.
> 
> Le diagramme doit montrer :
> 1. Les 3 couches : Client (navigateur), TanStack Start (middleware automatique), Serveur (Node.js)
> 2. Le flux de données : Composant React → Hook → Query → Server Function → Database
> 3. Les étapes d'exécution d'une Server Function : Middleware → Validation → Handler
> 4. Une comparaison visuelle avec une API REST traditionnelle
> 5. Un diagramme de séquence détaillant une requête complète avec gestion d'erreurs
> 
> Utilise des couleurs différentes pour chaque couche et ajoute des icônes emoji pour la lisibilité.
> Inclus des annotations pour expliquer chaque étape.

---

## 📚 Ressources Supplémentaires

- **Documentation officielle** : [TanStack Start Docs](https://tanstack.com/start)
- **Fichier du projet** : [docs/tanstack.md](./tanstack.md)
- **Exemples dans le projet** : [src/fn/events.ts](../src/fn/events.ts)

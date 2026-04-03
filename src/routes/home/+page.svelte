<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let selectedDecks = $state<Set<number>>(new Set());
	let cardCount = $state(10);
	let gameMode = $state<'answer' | 'question'>('answer');
	let questionType = $state<'qcm' | 'exact'>('qcm');
	let showImport = $state(false);

	let totalCards = $derived(
		data.decks.filter((d) => selectedDecks.has(d.id)).reduce((sum, d) => sum + Number(d.cardCount), 0)
	);

	let maxCards = $derived(Math.max(totalCards, 1));

	function toggleDeck(id: number) {
		const next = new Set(selectedDecks);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		selectedDecks = next;
	}

	let sessionUrl = $derived.by(() => {
		if (selectedDecks.size === 0) return null;
		const count = Math.min(cardCount, totalCards);
		const params = new URLSearchParams({
			decks: [...selectedDecks].join(','),
			count: String(count),
			mode: gameMode,
			type: questionType
		});
		return `/session?${params}`;
	});
</script>

<div class="xp-header">
	<div class="xp-left">
		<span class="xp-level">Niv. {data.xp.level}</span>
		<div class="xp-bar-track">
			<div class="xp-bar-fill" style="width: {Math.round(data.xp.progressPct * 100)}%"></div>
		</div>
	</div>
	<span class="xp-label">{data.xp.xpIntoLevel} / {data.xp.xpNeeded} XP</span>
</div>

<h1>Mes jeux de cartes</h1>

{#if form?.error}
	<div class="error-message" style="margin-top: 1rem">{form.error}</div>
{/if}

{#if form?.success}
	<div class="success-message" style="margin-top: 1rem">
		Jeu "{form.deckName}" importé avec succès !
	</div>
{/if}

<div class="actions-bar">
	<button class="btn-primary" onclick={() => (showImport = !showImport)}>
		{showImport ? 'Fermer' : 'Importer un jeu'}
	</button>
</div>

{#if showImport}
	<div class="card import-card fade-in">
		<h3>Importer un fichier JSON</h3>
		<form method="POST" action="?/import" enctype="multipart/form-data" use:enhance>
			<input type="file" name="file" accept=".json" required />
			<button type="submit" class="btn-primary">Importer</button>
		</form>
	</div>
{/if}

{#if data.decks.length === 0}
	<div class="card empty-state">
		<p>Aucun jeu de cartes disponible. Importez-en un pour commencer !</p>
	</div>
{:else}
	<div class="deck-list">
		{#each data.decks as deck (deck.id)}
			<div class="card deck-card" class:selected={selectedDecks.has(deck.id)}>
				<div class="deck-header">
					<label class="deck-select">
						<input
							type="checkbox"
							checked={selectedDecks.has(deck.id)}
							onchange={() => toggleDeck(deck.id)}
						/>
						<div>
							<strong>{deck.name}</strong>
							{#if deck.description}
								<p class="deck-desc">{deck.description}</p>
							{/if}
							<span class="deck-count">{deck.cardCount} cartes</span>
						</div>
					</label>
					<form method="POST" action="?/delete" use:enhance>
						<input type="hidden" name="deckId" value={deck.id} />
						<button type="submit" class="btn-danger btn-sm">Supprimer</button>
					</form>
				</div>
			</div>
		{/each}
	</div>

	{#if selectedDecks.size > 0}
		<div class="card config-card fade-in">
			<h2>Configurer la session</h2>

			<div class="config-field">
				<label for="cardCount">Nombre de cartes : {cardCount}</label>
				<input
					type="range"
					id="cardCount"
					min="1"
					max={maxCards}
					bind:value={cardCount}
				/>
				<span class="range-info">1 - {maxCards}</span>
			</div>

			<div class="config-field">
				<span class="field-label">Mode de jeu</span>
				<div class="radio-group">
					<label>
						<input type="radio" bind:group={gameMode} value="answer" />
						Deviner la réponse
					</label>
					<label>
						<input type="radio" bind:group={gameMode} value="question" />
						Deviner la question
					</label>
				</div>
			</div>

			<div class="config-field">
				<span class="field-label">Type de question</span>
				<div class="radio-group">
					<label>
						<input type="radio" bind:group={questionType} value="qcm" />
						QCM (4 choix)
					</label>
					<label>
						<input type="radio" bind:group={questionType} value="exact" />
						Réponse exacte
					</label>
				</div>
			</div>

			{#if sessionUrl}
				<a href={sessionUrl} class="btn-primary start-btn">
					Démarrer la session
				</a>
			{/if}
		</div>
	{/if}
{/if}

<style>
	.xp-header {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		margin-bottom: 1.2rem;
	}

	.xp-left {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		flex: 1;
	}

	.xp-level {
		font-size: 0.9rem;
		font-weight: 700;
		color: var(--accent-strong);
		white-space: nowrap;
	}

	.xp-bar-track {
		flex: 1;
		height: 8px;
		background: var(--surface);
		border-radius: 4px;
		overflow: hidden;
		border: 1px solid var(--accent-secondary);
	}

	.xp-bar-fill {
		height: 100%;
		background: var(--accent);
		border-radius: 4px;
		transition: width 0.4s ease;
	}

	.xp-label {
		font-size: 0.8rem;
		color: var(--accent-secondary);
		white-space: nowrap;
	}

	h1 {
		margin-bottom: 1rem;
	}

	.actions-bar {
		margin: 1rem 0;
	}

	.import-card {
		margin-bottom: 1rem;
	}

	.import-card form {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-top: 0.8rem;
	}

	.import-card h3 {
		margin-bottom: 0;
	}

	.empty-state {
		text-align: center;
		padding: 3rem;
		color: var(--accent-secondary);
	}

	.deck-list {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		margin-bottom: 1.5rem;
	}

	.deck-card {
		padding: 1rem 1.2rem;
		transition: border-color 0.2s;
	}

	.deck-card.selected {
		border-color: var(--accent);
		border-width: 2px;
	}

	.deck-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
	}

	.deck-select {
		display: flex;
		gap: 0.6rem;
		align-items: flex-start;
		cursor: pointer;
		flex: 1;
	}

	.deck-select input[type='checkbox'] {
		margin-top: 0.3rem;
		accent-color: var(--accent);
		width: 18px;
		height: 18px;
	}

	.deck-desc {
		color: var(--accent-secondary);
		font-size: 0.85rem;
		margin-top: 0.2rem;
	}

	.deck-count {
		font-size: 0.8rem;
		color: var(--text);
		opacity: 0.6;
	}

	.config-card {
		margin-top: 1rem;
	}

	.config-card h2 {
		margin-bottom: 1rem;
		font-size: 1.2rem;
	}

	.config-field {
		margin-bottom: 1rem;
	}

	.config-field > label,
	.config-field > .field-label {
		display: block;
		font-weight: 600;
		font-size: 0.9rem;
		color: var(--text-title);
		margin-bottom: 0.4rem;
	}

	.config-field input[type='range'] {
		width: 100%;
	}

	.range-info {
		font-size: 0.8rem;
		color: var(--accent-secondary);
	}

	.radio-group {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.radio-group label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		cursor: pointer;
	}

	.radio-group input[type='radio'] {
		accent-color: var(--accent);
	}

	.start-btn {
		width: 100%;
		padding: 0.8rem;
		font-size: 1.05rem;
		margin-top: 0.5rem;
		text-decoration: none;
		text-align: center;
		display: block;
	}

	.success-message {
		background: var(--correct-bg);
		color: #2e7d32;
		padding: 0.8rem 1rem;
		border-radius: var(--radius);
		border: 1px solid var(--correct);
		font-size: 0.9rem;
	}
</style>

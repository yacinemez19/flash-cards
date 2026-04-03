<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let currentIndex = $state(0);
	let score = $state(0);
	let answered = $state(false);
	let selectedAnswer = $state('');
	let isCorrect = $state(false);
	let finished = $state(false);
	let resultSaved = $state(false);
	let userInput = $state('');

	let currentCard = $derived(data.sessionCards[currentIndex]);

	let prompt = $derived(
		data.mode === 'answer' ? currentCard?.question : currentCard?.answer
	);

	let correctAnswer = $derived(
		data.mode === 'answer' ? currentCard?.answer : currentCard?.question
	);

	let displayChoices = $state<string[]>([]);

	$effect(() => {
		if (data.type !== 'qcm') return;
		const card = data.sessionCards[currentIndex];
		if (!card) return;
		const answer = data.mode === 'answer' ? card.answer : card.question;
		const others = data.allAnswers.filter((a) => a !== answer);
		const shuffled = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
		displayChoices = [...shuffled, answer].sort(() => Math.random() - 0.5);
	});

	function normalize(str: string): string {
		return str
			.toLowerCase()
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.trim();
	}

	function submitAnswer(answer: string) {
		if (answered) return;
		selectedAnswer = answer;
		isCorrect = normalize(answer) === normalize(correctAnswer);
		if (isCorrect) score++;
		answered = true;
	}

	function submitExact() {
		submitAnswer(userInput);
	}

	function nextCard() {
		if (currentIndex < data.totalCards - 1) {
			currentIndex++;
			answered = false;
			selectedAnswer = '';
			isCorrect = false;
			userInput = '';
		} else {
			finished = true;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && data.type === 'exact' && !answered && userInput.trim()) {
			submitExact();
		} else if (e.key === 'Enter' && answered && !finished) {
			nextCard();
		}
	}

	let percentage = $derived(finished ? Math.round((score / data.totalCards) * 100) : 0);

	$effect(() => {
		if (form?.saved) resultSaved = true;
	});
</script>

<svelte:window onkeydown={handleKeydown} />

{#if !finished}
	<div class="progress-bar">
		<div class="progress-fill" style="width: {((currentIndex + 1) / data.totalCards) * 100}%"></div>
	</div>
	<div class="progress-text">Carte {currentIndex + 1} / {data.totalCards}</div>

	<div class="card question-card fade-in" style="--key:{currentIndex}">
		<div class="mode-label">
			{data.mode === 'answer' ? 'Question' : 'Réponse'}
		</div>
		<h2 class="prompt">{prompt}</h2>

		{#if data.type === 'qcm'}
			<div class="choices">
				{#each displayChoices as choice}
					<button
						class="choice-btn"
						class:correct={answered && normalize(choice) === normalize(correctAnswer)}
						class:incorrect={answered && selectedAnswer === choice && !isCorrect}
						class:disabled={answered}
						onclick={() => submitAnswer(choice)}
						disabled={answered}
					>
						{choice}
					</button>
				{/each}
			</div>
		{:else}
			<div class="exact-input">
				<input
					type="text"
					bind:value={userInput}
					placeholder="Votre réponse..."
					disabled={answered}
				/>
				{#if !answered}
					<button class="btn-primary" onclick={submitExact} disabled={!userInput.trim()}>
						Valider
					</button>
				{/if}
			</div>
		{/if}

		{#if answered}
			<div class="feedback fade-in" class:feedback-correct={isCorrect} class:feedback-incorrect={!isCorrect}>
				{#if isCorrect}
					Correct !
				{:else}
					Incorrect. La bonne réponse : <strong>{correctAnswer}</strong>
				{/if}
			</div>
			<button class="btn-primary next-btn" onclick={nextCard}>
				{currentIndex < data.totalCards - 1 ? 'Suivant' : 'Voir les résultats'}
			</button>
		{/if}
	</div>
{:else}
	<div class="card result-card fade-in">
		<h1>Résultats</h1>

		<div class="score-display">
			<span class="score-number">{score}</span>
			<span class="score-divider">/</span>
			<span class="score-total">{data.totalCards}</span>
		</div>

		<div class="percentage" class:great={percentage >= 80} class:ok={percentage >= 50 && percentage < 80} class:bad={percentage < 50}>
			{percentage}%
		</div>

		{#if form?.isNewRecord}
			<div class="new-record fade-in">Nouveau record !</div>
		{/if}

		{#if !resultSaved}
			<form method="POST" action="?/saveResult" use:enhance>
				<input type="hidden" name="score" value={score} />
				<input type="hidden" name="total" value={data.totalCards} />
				<input type="hidden" name="deckIds" value={data.deckIds.join(',')} />
				<button type="submit" class="btn-primary" style="width:100%; margin-bottom: 0.5rem;">
					Sauvegarder le résultat
				</button>
			</form>
		{:else}
			<p class="saved-msg">Résultat sauvegardé !</p>
		{/if}

		<div class="result-actions">
			<a href="/session?decks={data.deckIds.join(',')}&count={data.totalCards}&mode={data.mode}&type={data.type}" class="btn-primary" style="text-decoration:none; text-align:center; display:block;">
				Rejouer
			</a>
			<a href="/home" class="btn-secondary" style="text-decoration:none; text-align:center; display:block;">
				Retour à l'accueil
			</a>
		</div>
	</div>
{/if}

<style>
	.progress-bar {
		width: 100%;
		height: 6px;
		background: var(--surface);
		border-radius: 3px;
		overflow: hidden;
		margin-bottom: 0.3rem;
	}

	.progress-fill {
		height: 100%;
		background: var(--accent);
		transition: width 0.3s ease;
		border-radius: 3px;
	}

	.progress-text {
		font-size: 0.85rem;
		color: var(--accent-secondary);
		margin-bottom: 1rem;
		text-align: right;
	}

	.question-card {
		text-align: center;
	}

	.mode-label {
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--accent-secondary);
		margin-bottom: 0.5rem;
	}

	.prompt {
		font-size: 1.4rem;
		margin-bottom: 1.5rem;
		line-height: 1.4;
	}

	.choices {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.6rem;
		margin-bottom: 1rem;
	}

	.choice-btn {
		padding: 0.8rem;
		background: white;
		border: 2px solid var(--accent-secondary);
		border-radius: var(--radius);
		font-size: 0.95rem;
		font-weight: 500;
		color: var(--text);
		cursor: pointer;
		transition: all 0.2s;
	}

	.choice-btn:hover:not(.disabled) {
		border-color: var(--accent);
		background: #fff9e6;
	}

	.choice-btn.correct {
		background: var(--correct-bg);
		border-color: var(--correct);
		color: #2e7d32;
	}

	.choice-btn.incorrect {
		background: var(--incorrect-bg);
		border-color: var(--incorrect);
		color: var(--accent-strong);
	}

	.choice-btn.disabled {
		cursor: default;
		opacity: 0.7;
	}

	.exact-input {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
		justify-content: center;
	}

	.exact-input input {
		flex: 1;
		max-width: 400px;
		text-align: center;
		font-size: 1.1rem;
	}

	.feedback {
		padding: 0.8rem;
		border-radius: var(--radius);
		font-weight: 600;
		margin-bottom: 1rem;
	}

	.feedback-correct {
		background: var(--correct-bg);
		color: #2e7d32;
		border: 1px solid var(--correct);
	}

	.feedback-incorrect {
		background: var(--incorrect-bg);
		color: var(--accent-strong);
		border: 1px solid var(--accent-strong);
	}

	.next-btn {
		width: 100%;
		padding: 0.7rem;
	}

	.result-card {
		text-align: center;
		padding: 2rem;
	}

	.result-card h1 {
		margin-bottom: 1.5rem;
	}

	.score-display {
		font-size: 3rem;
		font-weight: 700;
		color: var(--text-title);
		margin-bottom: 0.5rem;
	}

	.score-divider {
		opacity: 0.4;
		margin: 0 0.2rem;
	}

	.percentage {
		font-size: 2rem;
		font-weight: 700;
		margin-bottom: 1rem;
	}

	.percentage.great { color: var(--correct); }
	.percentage.ok { color: var(--accent); }
	.percentage.bad { color: var(--accent-strong); }

	.new-record {
		background: var(--accent);
		color: var(--accent-strong);
		padding: 0.6rem 1.2rem;
		border-radius: var(--radius);
		font-weight: 700;
		font-size: 1.1rem;
		display: inline-block;
		margin-bottom: 1.5rem;
	}

	.saved-msg {
		color: var(--correct);
		font-weight: 600;
		margin-bottom: 1rem;
	}

	.result-actions {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	@media (max-width: 500px) {
		.choices {
			grid-template-columns: 1fr;
		}
	}
</style>

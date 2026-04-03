<script lang="ts">
	let { data } = $props();

	function formatDate(date: string | Date | null) {
		if (!date) return '-';
		return new Date(date).toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}
</script>

<h1>Historique</h1>

{#if data.stats.length === 0}
	<div class="card empty-state">
		<p>Aucune session jouée pour l'instant.</p>
		<a href="/home" class="btn-primary" style="text-decoration:none; display:inline-block; margin-top:1rem;">
			Jouer maintenant
		</a>
	</div>
{:else}
	<div class="global-stats">
		<div class="card stat-box">
			<span class="stat-value">{data.totalSessions}</span>
			<span class="stat-label">Sessions jouées</span>
		</div>
		<div class="card stat-box">
			<span class="stat-value">{data.avgSuccess}%</span>
			<span class="stat-label">Taux de réussite moyen</span>
		</div>
	</div>

	<h2>Records par jeu</h2>

	<div class="stats-list">
		{#each data.stats as stat}
			<div class="card stat-card">
				<div class="stat-header">
					<strong>{stat.deckName}</strong>
					<span class="stat-sessions">{stat.sessions} session{stat.sessions > 1 ? 's' : ''}</span>
				</div>
				<div class="stat-details">
					<div>
						<span class="label">Meilleur score</span>
						<span class="value">{stat.best_score} / {stat.best_total}
							({stat.best_total > 0 ? Math.round((stat.best_score / stat.best_total) * 100) : 0}%)
						</span>
					</div>
					<div>
						<span class="label">Dernière session</span>
						<span class="value">{formatDate(stat.last_played)}</span>
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}

<style>
	h1 {
		margin-bottom: 1rem;
	}

	h2 {
		margin: 1.5rem 0 0.8rem;
		font-size: 1.1rem;
	}

	.empty-state {
		text-align: center;
		padding: 3rem;
		color: var(--accent-secondary);
	}

	.global-stats {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.8rem;
	}

	.stat-box {
		text-align: center;
		padding: 1.2rem;
	}

	.stat-value {
		display: block;
		font-size: 2rem;
		font-weight: 700;
		color: var(--accent-strong);
	}

	.stat-label {
		font-size: 0.85rem;
		color: var(--accent-secondary);
	}

	.stats-list {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.stat-card {
		padding: 1rem 1.2rem;
	}

	.stat-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.6rem;
	}

	.stat-sessions {
		font-size: 0.8rem;
		color: var(--accent-secondary);
	}

	.stat-details {
		display: flex;
		gap: 2rem;
		font-size: 0.9rem;
	}

	.stat-details .label {
		display: block;
		font-size: 0.8rem;
		color: var(--accent-secondary);
	}

	.stat-details .value {
		font-weight: 600;
		color: var(--text);
	}

	@media (max-width: 500px) {
		.global-stats {
			grid-template-columns: 1fr;
		}

		.stat-details {
			flex-direction: column;
			gap: 0.5rem;
		}
	}
</style>

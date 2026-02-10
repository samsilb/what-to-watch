// Mock recommendations database organized by mood
export const recommendationsByMood = {
  happy: [
    { title: "The Grand Budapest Hotel", type: "Movie", reason: "A whimsical visual feast that matches your bright energy." },
    { title: "Ted Lasso", type: "TV", reason: "Pure optimism wrapped in humor that'll keep your spirits high." },
    { title: "Amélie", type: "Movie", reason: "A charming tale of spreading joy that mirrors your mood." },
    { title: "Parks and Recreation", type: "TV", reason: "Feel-good comedy with characters as upbeat as you." },
    { title: "Singin' in the Rain", type: "Movie", reason: "Classic musical magic for your sunny disposition." },
  ],
  sad: [
    { title: "Inside Out", type: "Movie", reason: "Helps you process emotions through a heartwarming adventure." },
    { title: "Schitt's Creek", type: "TV", reason: "Starts cynical, ends hopeful—perfect emotional journey." },
    { title: "The Shawshank Redemption", type: "Movie", reason: "A story of hope that lifts you when you need it most." },
    { title: "Queer Eye", type: "TV", reason: "Genuine kindness and transformation to warm your heart." },
    { title: "Up", type: "Movie", reason: "A beautiful reminder that adventure awaits after sorrow." },
  ],
  anxious: [
    { title: "The Great British Bake Off", type: "TV", reason: "Gentle competition and soggy bottoms—pure calm." },
    { title: "My Neighbor Totoro", type: "Movie", reason: "Studio Ghibli's gentle embrace in animated form." },
    { title: "Bob Ross: Beauty Is Everywhere", type: "TV", reason: "Happy little trees to ease your worried mind." },
    { title: "Chef's Table", type: "TV", reason: "Beautiful, slow-paced culinary meditation." },
    { title: "Paddington 2", type: "Movie", reason: "Wholesome bear energy to melt your worries away." },
  ],
  bored: [
    { title: "Inception", type: "Movie", reason: "Mind-bending layers that demand your full attention." },
    { title: "Severance", type: "TV", reason: "Mysterious thriller that'll have you theorizing for days." },
    { title: "Everything Everywhere All at Once", type: "Movie", reason: "Multiverse madness that's impossible to look away from." },
    { title: "Breaking Bad", type: "TV", reason: "Gripping transformation that redefines binge-watching." },
    { title: "Parasite", type: "Movie", reason: "Genre-defying brilliance that commands every second." },
  ],
  romantic: [
    { title: "Pride and Prejudice", type: "Movie", reason: "Timeless slow-burn romance done to perfection." },
    { title: "Normal People", type: "TV", reason: "Achingly beautiful portrait of young love." },
    { title: "When Harry Met Sally", type: "Movie", reason: "The gold standard of romantic comedies." },
    { title: "Fleabag", type: "TV", reason: "Unconventional love story that breaks your heart beautifully." },
    { title: "La La Land", type: "Movie", reason: "Dreamlike romance with music that stays with you." },
  ],
  adventurous: [
    { title: "Mad Max: Fury Road", type: "Movie", reason: "Non-stop adrenaline through a breathtaking wasteland." },
    { title: "The Mandalorian", type: "TV", reason: "Space western adventures with a tiny green friend." },
    { title: "Indiana Jones: Raiders of the Lost Ark", type: "Movie", reason: "The template for adventure done right." },
    { title: "Arcane", type: "TV", reason: "Stunning animation with pulse-pounding action." },
    { title: "Top Gun: Maverick", type: "Movie", reason: "Soaring spectacle that puts you in the cockpit." },
  ],
};

export const moods = [
  { id: 'happy', label: 'Happy', emoji: '😊', color: '#fbbf24' },
  { id: 'sad', label: 'Sad', emoji: '😢', color: '#60a5fa' },
  { id: 'anxious', label: 'Anxious', emoji: '😰', color: '#a78bfa' },
  { id: 'bored', label: 'Bored', emoji: '😐', color: '#6b7280' },
  { id: 'romantic', label: 'Romantic', emoji: '💕', color: '#f472b6' },
  { id: 'adventurous', label: 'Adventurous', emoji: '🔥', color: '#f97316' },
];

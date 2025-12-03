import random
import copy

class PuissanceAI:
    """Intelligence Artificielle pour le jeu Puissance 4"""
    
    def __init__(self, difficulty='medium'):
        self.difficulty = difficulty
        self.max_depth = {
            'easy': 2,
            'medium': 4,
            'hard': 6
        }.get(difficulty, 4)
    
    def get_move(self, board, player=2):
        """Retourne la meilleure colonne à jouer pour l'IA"""
        if self.difficulty == 'easy':
            return self._random_move(board)
        elif self.difficulty == 'medium':
            return self._smart_move(board, player)
        else:  # hard
            return self._minimax_move(board, player)
    
    def _random_move(self, board):
        """IA facile : coup aléatoire valide"""
        valid_moves = self._get_valid_moves(board)
        return random.choice(valid_moves) if valid_moves else None
    
    def _smart_move(self, board, player):
        """IA moyenne : vérifie les victoires/blocages + quelques coups d'avance"""
        # 1. Vérifier si l'IA peut gagner
        for col in self._get_valid_moves(board):
            if self._can_win(board, col, player):
                return col
        
        # 2. Vérifier si l'adversaire peut gagner et le bloquer
        opponent = 1 if player == 2 else 2
        for col in self._get_valid_moves(board):
            if self._can_win(board, col, opponent):
                return col
        
        # 3. Jouer au centre de préférence
        center_col = 3
        if self._is_valid_move(board, center_col):
            return center_col
        
        # 4. Jouer près du centre
        for offset in [1, 2, 3]:
            for col in [center_col - offset, center_col + offset]:
                if 0 <= col < 7 and self._is_valid_move(board, col):
                    return col
        
        # 5. Coup aléatoire en dernier recours
        return self._random_move(board)
    
    def _minimax_move(self, board, player):
        _, best_col = self._minimax(board, self.max_depth, -float('inf'), float('inf'), True, player)
        return best_col
    
    def _minimax(self, board, depth, alpha, beta, maximizing_player, player):
        winner = self._check_winner(board)
        
        # Cas terminaux
        if depth == 0 or winner != 0 or self._is_board_full(board):
            return self._evaluate_board(board, player), None
        
        valid_moves = self._get_valid_moves(board)
        best_col = valid_moves[0] if valid_moves else None
        
        if maximizing_player:
            max_eval = -float('inf')
            for col in valid_moves:
                new_board = self._simulate_move(board, col, player)
                eval_score, _ = self._minimax(new_board, depth - 1, alpha, beta, False, player)
                
                if eval_score > max_eval:
                    max_eval = eval_score
                    best_col = col
                
                alpha = max(alpha, eval_score)
                if beta <= alpha:
                    break  # Élagage alpha-beta
            
            return max_eval, best_col
        else:
            min_eval = float('inf')
            opponent = 1 if player == 2 else 2
            for col in valid_moves:
                new_board = self._simulate_move(board, col, opponent)
                eval_score, _ = self._minimax(new_board, depth - 1, alpha, beta, True, player)
                
                if eval_score < min_eval:
                    min_eval = eval_score
                    best_col = col
                
                beta = min(beta, eval_score)
                if beta <= alpha:
                    break  # Élagage alpha-beta
            
            return min_eval, best_col
    
    def _evaluate_board(self, board, player):
        """Évalue la position du plateau pour l'IA"""
        opponent = 1 if player == 2 else 2
        score = 0
        
        # Vérifier toutes les fenêtres de 4 cases
        for row in range(6):
            for col in range(7):
                # Horizontal
                if col <= 3:
                    window = [board[row][col + i] for i in range(4)]
                    score += self._evaluate_window(window, player)
                
                # Vertical
                if row <= 2:
                    window = [board[row + i][col] for i in range(4)]
                    score += self._evaluate_window(window, player)
                
                # Diagonal positive
                if row <= 2 and col <= 3:
                    window = [board[row + i][col + i] for i in range(4)]
                    score += self._evaluate_window(window, player)
                
                # Diagonal negative
                if row >= 3 and col <= 3:
                    window = [board[row - i][col + i] for i in range(4)]
                    score += self._evaluate_window(window, player)
        
        return score
    
    def _evaluate_window(self, window, player):
        """Évalue une fenêtre de 4 cases"""
        opponent = 1 if player == 2 else 2
        score = 0
        
        player_count = window.count(player)
        opponent_count = window.count(opponent)
        empty_count = window.count(0)
        
        if player_count == 4:
            score += 100
        elif player_count == 3 and empty_count == 1:
            score += 10
        elif player_count == 2 and empty_count == 2:
            score += 2
        
        if opponent_count == 3 and empty_count == 1:
            score -= 80  # Bloquer l'adversaire est important
        elif opponent_count == 2 and empty_count == 2:
            score -= 5
        
        return score
    
    def _can_win(self, board, col, player):
        """Vérifie si jouer dans cette colonne permet de gagner"""
        if not self._is_valid_move(board, col):
            return False
        
        new_board = self._simulate_move(board, col, player)
        return self._check_winner(new_board) == player
    
    def _simulate_move(self, board, col, player):
        """Simule un coup sans modifier le plateau original"""
        new_board = copy.deepcopy(board)
        for row in range(5, -1, -1):
            if new_board[row][col] == 0:
                new_board[row][col] = player
                break
        return new_board
    
    def _get_valid_moves(self, board):
        """Retourne la liste des colonnes où on peut jouer"""
        return [col for col in range(7) if self._is_valid_move(board, col)]
    
    def _is_valid_move(self, board, col):
        """Vérifie si on peut jouer dans cette colonne"""
        return 0 <= col < 7 and board[0][col] == 0
    
    def _is_board_full(self, board):
        """Vérifie si le plateau est plein"""
        return all(board[0][col] != 0 for col in range(7))
    
    def _check_winner(self, board):
        """Vérifie s'il y a un gagnant (copie de la logique du jeu principal)"""
        rows, cols = 6, 7
        
        # Vérification horizontale
        for row in range(rows):
            for col in range(cols - 3):
                if (board[row][col] != 0 and 
                    board[row][col] == board[row][col + 1] == 
                    board[row][col + 2] == board[row][col + 3]):
                    return board[row][col]
        
        # Vérification verticale
        for row in range(rows - 3):
            for col in range(cols):
                if (board[row][col] != 0 and 
                    board[row][col] == board[row + 1][col] == 
                    board[row + 2][col] == board[row + 3][col]):
                    return board[row][col]
        
        # Vérification diagonale (haut-gauche vers bas-droite)
        for row in range(rows - 3):
            for col in range(cols - 3):
                if (board[row][col] != 0 and 
                    board[row][col] == board[row + 1][col + 1] == 
                    board[row + 2][col + 2] == board[row + 3][col + 3]):
                    return board[row][col]
        
        # Vérification diagonale (haut-droite vers bas-gauche)
        for row in range(rows - 3):
            for col in range(3, cols):
                if (board[row][col] != 0 and 
                    board[row][col] == board[row + 1][col - 1] == 
                    board[row + 2][col - 2] == board[row + 3][col - 3]):
                    return board[row][col]
        
        return 0
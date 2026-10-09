import { Router } from 'express';
import { getGenres, getGenreMovies } from '../controllers/genreController';

const router = Router();

router.get('/', getGenres);
router.get('/:slugOrId/movies', getGenreMovies);

export default router;

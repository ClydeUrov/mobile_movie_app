import { Client, ID, Query, TablesDB } from "react-native-appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const TABLE_ID = process.env.EXPO_PUBLIC_APPWRITE_TABLE_ID!;

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)

const tables = new TablesDB(client);

export const updateSearchCountTable = async ( query: string, movie: Movie ) => {
    try {

        const result = await tables.listRows(DATABASE_ID, TABLE_ID, [
            Query.equal("searchTerm", query),
        ]);

        if (result.rows.length > 0) {
            const existingRow = result.rows[0];

            await tables.updateRow(
                DATABASE_ID,
                TABLE_ID,
                existingRow.$id,
                {
                    count: (existingRow.count ?? 0) + 1,
                }
            );

        } else {
            await tables.createRow(DATABASE_ID, TABLE_ID, ID.unique(), {
                searchTerm: query,
                movie_id: movie.id,
                count: 1,
                title: movie.title,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            });
        }

    } catch (error) {
        console.error("Table Error:", error);
        throw error;
    }
}

export const getTrendingMovies = async (): Promise<TrendingMovie[] | undefined> => {
    try {
        const result = await tables.listRows(DATABASE_ID, TABLE_ID, [
            Query.limit(5),
            Query.orderDesc('count'),
        ]);

        return result.rows as unknown as TrendingMovie[];
    } catch (error) {
        console.log(error);
        return undefined;
    }
}
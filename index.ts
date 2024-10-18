import { ApolloServer } from '@apollo/server'; // preserve-line
import { startStandaloneServer } from '@apollo/server/standalone'; // preserve-line
import { PrismaClient } from '@prisma/client'; 
import  Dataloader  from 'dataloader'; // preserve-line 
import { create } from 'domain';
import express from 'express';
import cookieParser from 'cookie-parser';
import { expressMiddleware } from '@apollo/server/express4';

const prisma = new PrismaClient();

declare module 'express-serve-static-core' {
    interface Request {
        authenticated: boolean;
    }
}

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `#graphql
    scalar Date

    type Content {
        id: String!
        type: Type!
        title: String!
        description: String!
        seasons: Int!
        episodes: Int!
        category: Category! #à changer pour mettre une liste d'objet category
        isInList: Boolean!
        isPublished: Boolean!
        datePublished: Date!
        # language: enum!
        # subtitles: enum!     
    }

    type LikedContent {
        profilelId: String!
        content: [Content!]!
        profile: Profile!
    }

    type List {
        profileId: String!
        content: [Content!]!
        profile: Profile!
    }

    type Account {
        id: String!
        # typeSubscription: enum! #à changer pour mettre un objet subscription
        firstName: String!
        lastName: String!
        # paymentMethod: enum!
        password: String!
        email: String!
        phoneNumber: String!
        # device: enum! #à changer pour mettre une liste d'objet device
        profiles: [Profile!]!
    }

    type Profile {
        id: String!
        name: String!
        # language: enum!
        avatar: String!
        isKid: Boolean!
        # restrictions: enum! #à changer pour mettre un objet restriction
        list: [List!]!
    }

    type Category {
        id: String!
        name: String!
        content: [Content!]!
    }

    type Type {
        id: String!
        name: String!
        content: [Content!]!
    }

    type Mutation {
        # createContent(
        #     type: String!, 
        #     title: String!, 
        #     description: String!, 
        #     seasons: Int!, 
        #     episodes: Int!, 
        #     categoryId: String!, 
        #     isInList: Boolean!, 
        #     isPublished: Boolean!, 
        #     datePublished: Date!
        # ): Content!
    
        createType(
            name: String!
        ): Type!
    }

    type Query {
        content: [Content!]!
        contentById(id: String!): Content
        likedContent: [LikedContent!]!
        likedContentById(id: String!): LikedContent
        list: [List!]!
        listById(id: String!): List
        account: [Account!]!
        accountById(id: String!): Account
        profile: [Profile!]!
        profileById(id: String!): Profile
        category: [Category!]!
        categoryById(id: String!): Category
        type: [Type!]!
        typeById(id: String!): Type
        listByProfileId(profileId: String!): [List!]!
        contentByCategoryId(categoryId: String!): [Content!]!
        contentByTypeId(typeId: String!): [Content!]!
    }

    # enum TypeSubscription {
    #     FREE = 'FREE',
    #     BASIC = 'BASIC',
    #     PREMIUM = 'PREMIUM',
    # }

    # enum Device {
    #     MOBILE = 'MOBILE',
    #     TABLET = 'TABLET',
    #     DESKTOP = 'DESKTOP',
    #     TV = 'TV',
    # }
`;

// const content = [
//     {
//         id: '1',
//         typeId: '1',
//         title: 'The Shawshank Redemption',
//         description: 'Two imprisoned',
//         seasons: 1,
//         episodes: 1,
//         categoryId: 1,
//         isInList: true,
//         isPublished: true,
//         datePublished: '1994-09-14',
//     },
//     {
//         id: '2',
//         typeId: '2',
//         title: 'Breaking Bad',
//         description: 'A high school chemistry teacher turned meth',
//         seasons: 5,
//         episodes: 62,
//         categoryId: 2,
//         isInList: true,
//         isPublished: true,
//         datePublished: '2008-01-20',
//     },
//     {
//         id: '3',
//         typeId: '1',
//         title: 'The Dark Knight',
//         description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
//         seasons: 1,
//         episodes: 1,
//         categoryId: 3,
//         isInList: true,
//         isPublished: true,
//         datePublished: '2008-07-14',
//     },
// ];

// const likedContent = [
//     {
//         profileId: '1',
//         contentIds: ['1', '2'],
//     },
//     {
//         profileId: '2',
//         contentIds: ['3'],
//     }
// ];

// const list = [
//     {
//         profileId: '1',
//         contentIds: ['3', '2'],
//     },
//     {
//         profileId: '2',
//         contentIds: ['1'],
//     }
// ];

// const account = [
//     {
//         id: '1',
//         // typeSubscriptionId: '1',
//         firstName: 'John',
//         lastName: 'Doe',
//         // paymentMethodId: '1',
//         password: 'password',
//         email: 'unemail',
//         phoneNumber: '123456789',
//         // deviceId: '1',
//         profileIds: ['1'],
//     },
// ];

// const profile = [
//     {
//         id: '1',
//         name: 'John',
//         // languageId: '1',
//         avatar: 'unavatar',
//         isKid: false,
//         // restrictionId: '1',
//         listIds: ['1'],
//     },
//     {
//         id: '2',
//         name: 'Jane',
//         // languageId: '2',
//         avatar: 'unavatarpourjane',
//         isKid: true,
//         // restrictionId: '2',
//         listIds: ['2'],
//     }
// ];

// const category = [
//     {
//         id: '1',
//         name: 'Drama',
//         contentIds: ['1'],
//     },
//     {
//         id: '2',
//         name: 'Violent',
//         contentIds: ['2'],
//     },
//     {
//         id: '3',
//         name: 'Action',
//         contentIds: ['3'],
//     }
// ];

// const type = [
//     {
//         id: '1',
//         name: 'Movie',
//         contentIds: ['1', '3'],
//     },
//     {
//         id: '2',
//         name: 'Series',
//         contentIds: ['2'],
//     }
// ];

const typeById = new Dataloader(async (ids: string[]) => {
    const types = await prisma.type.findMany({ where: { id: { in: ids } } });
    return ids.map(id => types.find(type => type.id === id));
});

const categoryById = new Dataloader(async (ids: string[]) => {
    const categories = await prisma.category.findMany({ where: { id: { in: ids } } });
    return ids.map(id => categories.find(category => category.id === id));
});

const profileById = new Dataloader(async (ids: string[]) => {
    const profiles = await prisma.profile.findMany({ where: { id: { in: ids } } });
    return ids.map(id => profiles.find(profile => profile.id === id));
});

const listByProfileId = new Dataloader(async (profileIds: string[]) => {
    const lists = await prisma.list.findMany({ where: { profileId: { in: profileIds } } });
    return profileIds.map(profileId => lists.filter(list => list.profileId === profileId));
});

const contentByCategoryId = new Dataloader(async (categoryIds: string[]) => {
    const contents = await prisma.content.findMany({ where: { categories: { some:{id: { in: categoryIds }} } }, include: { categories: true } });
    return categoryIds.map(categoryId => contents.filter(content => content.categories.some(category => category.id === categoryId )));
});

const contentByTypeId = new Dataloader(async (typeIds: string[]) => {
    const contents = await prisma.content.findMany({ where: { typeId: { in: typeIds } } });
    return typeIds.map(typeId => contents.filter(content => content.typeId === typeId));
});

const accountById = new Dataloader(async (ids: string[]) => {
    const accounts = await prisma.account.findMany({ where: { id: { in: ids } } });
    return ids.map(id => accounts.find(account => account.id === id));
});

// const authorById = new Dataloader(async (ids: string[]) => {
//     const authors = await prisma.author.findMany({ where: { id: { in: ids } } });
//     return ids.map(id => authors.find(author => author.id === id));
// });

// const booksByAuthorId = new Dataloader(async (authorIds: string[]) => {
//     const books = await prisma.book.findMany({ where: { authorId: { in: authorIds } } });
//     return authorIds.map(authorId => books.filter(book => book.authorId === authorId));
// });

// const booksByCategoryId = new Dataloader(async (categoryIds: string[]) => {
//     const books = await prisma.book.findMany({ where: { categoryId: { in: categoryIds } } });
//     return categoryIds.map(categoryId => books.filter(book => book.categoryId === categoryId));
// });                    

function wrapResolverWithAuthenticator(resolver) {
    return (parent, args, context, info) => {
        if (!context.authenticated) {
            throw new Error('Not authenticated');
        }
        return resolver(parent, args, context, info);
    };
}

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
    Query: {
        content: wrapResolverWithAuthenticator(() => prisma.content.findMany()),
        contentByCategoryId: async (_, { id }) => await contentByCategoryId.load(id),
        contentByTypeId: async (_, { id }) => await contentByTypeId.load(id),
        likedContent: async () => await prisma.likedContent.findMany(),
        list: async () => await prisma.list.findMany(),
        listByProfileId: async (_, { profileId }) => await listByProfileId.load(profileId),
        account: async () => await prisma.account.findMany(),
        accountById: async (_, { id }) => await accountById.load(id),
        profile: async (_, { id }) => await prisma.profile.findUnique({ where: { id } }),
        profileById: async (_, { id }) => await profileById.load(id),
        category: async () => await prisma.category.findMany(),
        categoryById: async (_, { id }) => await categoryById.load(id),
        type: async () => await prisma.type.findMany(),
        typeById: async (_, { id }) => await typeById.load(id),
    },

    Content: {
        type: ({ typeId }) => typeById.load(typeId),
        category: ({ categoryId }) => categoryById.load(categoryId),
    },

    LikedContent: {
        profile: ({ profileId }) => profileById.load(profileId),
    },

    List: {
        profile: ({ profileId }) => profileById.load(profileId),
    },

    Account: {
        profiles: ({ id }) => prisma.profile.findMany({ where: { accountId: id } }),
    },

    Profile: {
        list: async ({ id }) => await listByProfileId.load(id),
    },

    Category: {
        content: async ({ id }) => await contentByCategoryId.load(id),
    },

    Type: {
        content: async ({ id }) => await contentByTypeId.load(id),
    },
   
    Mutation: {
        // createBook: async (_, { title, authorId, categoryId }) => {
        //     return await prisma.book.create({
        //         data: {
        //             title,
        //             authorId,
        //             categoryId,
        //         },
        //     });
        // },

        // createContent: async (_, { type, title, description, seasons, episodes, categoryId, isInList, isPublished, datePublished }) => {
        //     return await prisma.content.create({
        //         data: {
        //             type,
        //             title,
        //             description,
        //             seasons,
        //             episodes,
        //             categoryId,
        //             isInList,
        //             isPublished,
        //             datePublished,
        //         },
        //     });
        // }

        createType: async (_, { name }) => {
            return await prisma.type.create({
                data: {
                    name,
                },
            });
        },
    },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
    typeDefs,
    resolvers,
});
  
// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
await server.start();

const app = express();

app.use(cookieParser('mysecret', {
    sameSite: 'strict',
    httpOnly: true,
    // secure: true,
    signed: true,
}));

app.get('/login', (req, res) => {
    res.cookie('mycookie', 'myvalue', {
        signed: true,
        httpOnly: true,
        sameSite: 'strict',
    });
    res.send('Logged in');
});

app.use((req, res, next) => {
    if(req.signedCookies.mycookie) {
        req.authenticated = true;
    }
    next();
});

app.use(
    `/graphql` , 
    express.json(), 
    expressMiddleware(server, {
        context:  async ({ req }) => {
            return {
                authenticated: req.authenticated,
            };
        },
    })
);

app.listen(4000, () => {
    console.log(`🚀 Server ready at http://localhost:4000/graphql`);
});
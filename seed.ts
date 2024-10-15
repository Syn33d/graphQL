import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {

    // Seed categories
    const categories = [
        { id: '1', name: 'Drama' },
        { id: '2', name: 'Crime' },
        { id: '3', name: 'Action' },
    ];

    for (const category of categories) {
        await prisma.category.create({
            data: {
                id: category.id,
                name: category.name,
            },
        });
    }

    // Seed types
    const types = [
        { id: '1', name: 'Movie' },
        { id: '2', name: 'Series' },
    ];

    for (const type of types) {
        await prisma.type.create({
            data: {
                id: type.id,
                name: type.name,
            },
        });
    }

    // Seed content
    const content = [
        {
            id: '1',
            typeId: '1',
            title: 'The Shawshank Redemption',
            description: 'Two imprisoned',
            seasons: 1,
            episodes: 1,
            categoryId: '1',
            isInList: true,
            isPublished: true,
            datePublished: new Date('1994-09-14'),
        },
        {
            id: '2',
            typeId: '2',
            title: 'Breaking Bad',
            description: 'A high school chemistry teacher turned meth',
            seasons: 5,
            episodes: 62,
            categoryId: '2',
            isInList: true,
            isPublished: true,
            datePublished: new Date('2008-01-20'),
        },
        {
            id: '3',
            typeId: '1',
            title: 'Inception',
            description: 'A thief who steals corporate secrets through the use of dream-sharing technology',
            seasons: 1,
            episodes: 1,
            categoryId: '3',
            isInList: false,
            isPublished: true,
            datePublished: new Date('2010-07-16'),
        },
    ];

    for (const item of content) {
        await prisma.content.create({
            data: {
                id: item.id,
                typeId: item.typeId,
                title: item.title,
                description: item.description,
                seasons: item.seasons,
                episodes: item.episodes,
                isInList: item.isInList,
                isPublished: item.isPublished,
                datePublished: item.datePublished,
                categoryId: item.categoryId,
                categories: {
                    connect: { id: item.categoryId },
                },
            },
        });
    }

    // Seed accounts
    const accounts = [
        {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            password: 'password123',
            email: 'john.doe@example.com',
            phoneNumber: '1234567890',
        },
        {
            id: '2',
            firstName: 'Jane',
            lastName: 'Doe',
            password: 'password456',
            email: 'jane.doe@example.com',
            phoneNumber: '0987654321',
        },
    ];

    for (const account of accounts) {
        await prisma.account.create({
            data: {
                id: account.id,
                firstName: account.firstName,
                lastName: account.lastName,
                password: account.password,
                email: account.email,
                phoneNumber: account.phoneNumber,
            },
        });
    }

    // Seed profiles
    const profiles = [
        {
            id: '1',
            name: 'John',
            avatar: 'unavatar',
            isKid: false,
            restrictionId: '1',
            listIds: ['1'],
        },
        {
            id: '2',
            name: 'Jane',
            avatar: 'unavatarpourjane',
            isKid: false,
            restrictionId: '2',
            listIds: ['2'],
        },
    ];

    for (const profile of profiles) {
        await prisma.profile.create({
            data: {
                id: profile.id,
                name: profile.name,
                avatar: profile.avatar,
                isKid: profile.isKid,
                accountId: accounts[parseInt(profile.id) - 1].id,
            },
        });
    }

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

    // // Seed lists
    // const lists = [
    //     {
    //         profileId: '1',
    //         contentIds: ['1', '2'],
    //     },
    //     {
    //         profileId: '2',
    //         contentIds: ['3'],
    //     },
    // ];

    // for (const list of lists) {
    //     for (const contentId of list.contentIds) {
    //         await prisma.list.create({
    //             data: {
    //                 profileId: `${list.profileId}-${contentId}`,
    //                 Profile: {
    //                     connect: { id: list.profileId },
    //                 },
    //                 content: {
    //                     connect: { id: contentId },
    //                 },
    //             },
    //         });
    //     }
    // }

    // // Seed liked content
    // const likedContents = [
    //     {
    //         profileId: '1',
    //         contentIds: ['1', '2'],
    //     },
    //     {
    //         profileId: '2',
    //         contentIds: ['3'],
    //     },
    // ];

    // for (const likedContent of likedContents) {
    //     for (const contentId of likedContent.contentIds) {
    //         await prisma.likedContent.create({
    //             data: {
    //                 id: `${likedContent.profileId}-${contentId}`,
    //                 profile: {
    //                     connect: { id: likedContent.profileId },
    //                 },
    //                 content: {
    //                     connect: { id: contentId },
    //                 },
    //             },
    //         });
    //     }
    // }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
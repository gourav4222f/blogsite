import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clean up existing data to prevent duplicates
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.relation.deleteMany();
  await prisma.user.deleteMany(); // Deleting users for a clean seed run

  // 2. Create 10 Users
  const users = [];
  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        username: faker.internet.username().toLowerCase(),
        email: faker.internet.email().toLowerCase(),
        image: faker.image.avatar(),
        createdAt: faker.date.past(),
      },
    });
    users.push(user);
  }
  console.log(`Created ${users.length} users.`);

  // 3. Create Posts for each user
  const posts = [];
  for (const user of users) {
    for (let i = 0; i < 5; i++) {
      const post = await prisma.post.create({
        data: {
          content: faker.lorem.paragraph(3),
          authorId: user.id,
          createdAt: faker.date.between({ from: user.createdAt, to: new Date() }),
        },
      });
      posts.push(post);
    }
  }
  console.log(`Created ${posts.length} posts.`);

  // 4. Create Follow relationships
  for (const user of users) {
    const usersToFollow = users
      .filter((u) => u.id !== user.id)
      .slice(0, Math.floor(Math.random() * 5)); // Follow 0-4 other users
    for (const targetUser of usersToFollow) {
      await prisma.relation.create({
        data: {
          followerId: user.id,
          followingId: targetUser.id,
        },
      });
    }
  }
  console.log('Created follow relationships.');

  // 5. Create Likes
  for (const post of posts) {
    const usersWhoLiked = users.slice(
      0,
      Math.floor(Math.random() * users.length) // 0 to all users might like it
    );
    for (const user of usersWhoLiked) {
      await prisma.like.create({
        data: {
          postId: post.id,
          userId: user.id,
        },
      });
    }
  }
  console.log('Created likes.');

  // 6. Create Comments and Replies
  for (const post of posts) {
    const numComments = Math.floor(Math.random() * 4);
    const topLevelComments = [];
    for (let i = 0; i < numComments; i++) {
      const commentUser = users[Math.floor(Math.random() * users.length)];
      const comment = await prisma.comment.create({
        data: {
          content: faker.lorem.sentence(),
          postId: post.id,
          authorId: commentUser.id,
        },
      });
      topLevelComments.push(comment);
    }

    for (const topComment of topLevelComments) {
        if (Math.random() > 0.5) { 
            const numReplies = Math.floor(Math.random() * 3);
            for (let j = 0; j < numReplies; j++) {
                const replyUser = users[Math.floor(Math.random() * users.length)];
                await prisma.comment.create({
                    data: {
                        content: faker.lorem.sentence(),
                        postId: post.id,
                        authorId: replyUser.id,
                        parentId: topComment.id,
                    },
                });
            }
        }
    }
  }
  console.log('Created comments and replies.');

  console.log('Database seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


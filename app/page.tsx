import { readPosts } from '@/lib/posts';
import HomeClient from '@/components/HomeClient';

export default function Home() {
  return <HomeClient posts={readPosts()} />;
}

import type { NextPage} from 'next'
import Link from "next/link"
import commonStyles from "../styles/common.module.scss"
import {FiCalendar, FiUser} from "react-icons/fi"
import Head from "next/head"
import styled from "./home.module.scss"
import Header from '../components/Header'
import { getPrismicClient } from '../services/prismic'
import { useState } from 'react';



interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
    readTime: number;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}


const Home: NextPage = ({postsPagination}:HomeProps) => {

  const formattedPost = postsPagination.results.map(post => {
    return{
      ...post
    }
  })

  const [posts, setPosts] = useState<Post[]>(formattedPost)
  const [nextPage, setNextPage] = useState(postsPagination.next_page)
  const [currentPage, setCurrentPage] = useState(1)

  async function handleNextPage(): Promise<void>{
    try{
      if(currentPage != 1 && nextPage === null){
        return
      }

      const postsResults = await fetch(`${nextPage}`).then(response =>
        response.json()
      )

      setNextPage(postsResults.next_page)
      setCurrentPage(postsResults.page)

      const newPosts = postsResults.results.map(post => {
        return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        }
      }
      });
      setPosts([...posts, ...newPosts])
      alert("Bom")
    } catch {
      alert("Erro")
    }
  }


  return (
    <>
    <Head>
      <title>Home | spacingtraviling</title>
    </Head>

    <main className={commonStyles.container}>
      <Header/>

      <div className={styled.containerPosts}>
        {posts.map(post => (
          <Link href={`/post/${post.uid}`}>
            <a className={styled.post}>
              <strong>{post.data.title}</strong>
              <p>{post.data.subtitle}</p>
              <ul>
                <li>
                  <FiCalendar/>
                  {new Intl.DateTimeFormat("pt-BR", { day:"numeric", month:"short", year:"numeric"}).format(
                    new Date(post.first_publication_date)
                  )}
                </li>
                <li>
                  <FiUser/>
                  {post.data.author}
                </li>
              </ul>
            </a>
          </Link>
        ))}
        {nextPage && (
          <button type="button" onClick={handleNextPage}>Carregar mais posts</button>
        )}
      </div>
    </main>
  </>
  )
}
export default Home

export const getStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType(
    "posts",
    {
      pageSize:1,
    }
  );

  const posts =  postsResponse.results.map(post =>{
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  })

  const postsPagination = {
    next_page: postsResponse.next_page,
    results:posts,
  }

  return {
    props:{
      postsPagination
    }
  }
};

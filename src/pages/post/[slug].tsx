import { GetStaticPaths, GetStaticProps } from 'next';
import Header from '../../components/Header';
import {FiCalendar, FiClock, FiUser} from "react-icons/fi"
import { useRouter } from 'next/router';

import { getPrismicClient } from '../../services/prismic';

import { RichText } from 'prismic-dom';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({post}: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

 const totalWords = post.data.content.reduce((total, contentItem) => {
  const headingTime = contentItem.heading?.split(/\s+/).length;
  const wordsTime = RichText.asText(contentItem.body)?.split(/\s+/).length;

    return total + headingTime + wordsTime;
  }, 0);
  const readTime = Math.ceil(totalWords / 200);



  return(
    <>
      <Header/>
      <img src={post.data.banner.url} alt="imagem" className={styles.banner}/>
      <section className={commonStyles.container}>
        <div className={styles.post}>
          <div className={styles.postTop}>
            <h1>{post.data.title}</h1>
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
              <li>
                <FiClock/>{`${readTime} min`}
              </li>
            </ul>
          </div>

          {post.data.content.map(content => {
            return (
              <article key={content.heading}>
                <h2>{content.heading}</h2>
                <div
                  className={styles.postContent}
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </article>
            )
          })}

        </div>
      </section>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType("posts");

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid
      },
    }
  })

  return{
    paths,
    fallback:true,

  }
};

export const getStaticProps: GetStaticProps = async (context) => {
  const prismic = getPrismicClient({});
  const {slug} = context.params
  const response = await prismic.getByUID("posts", String(slug), {});
  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.author,
      author: response.data.author,
      banner: {
        url: response.data.banner.url
      },
      content: response.data.content.map(content => {
        return{
          heading: content.heading,
          body: [...content.body],
        }
      })
    },
  }

  return {
    props:{
      post,
    }
  }
};

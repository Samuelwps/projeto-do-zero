import { setPreviewData, redirectToPreviewURL } from '@prismicio/next'
import { getPrismicClient } from '../../services/prismic'

export default async (req, res) => {
  const client = getPrismicClient({ req })

  await setPreviewData({ req, res })

  await redirectToPreviewURL({ req, res, client })
}

import { getContent } from '@/lib/content'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Gallery from '@/components/Gallery'
import PriceMenu from '@/components/PriceMenu'
import WorkingHours from '@/components/WorkingHours'
import Reviews from '@/components/Reviews'
import LeadForm from '@/components/LeadForm'
import Contacts from '@/components/Contacts'
import Footer from '@/components/Footer'

export const revalidate = 60

export default function Home() {
  const data = getContent()

  return (
    <>
      <Navbar />
      <main>
        <Hero data={data.hero} />
        <About data={data.about} />
        <Gallery data={data.gallery} />
        <PriceMenu data={data.price} />
        <WorkingHours data={data.hours} />
        <Reviews data={data.reviews} />
        <LeadForm />
        <Contacts data={data.contacts} />
      </main>
      <Footer footer={data.footer} contacts={data.contacts} />
    </>
  )
}

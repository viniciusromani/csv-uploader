import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  Button,
  Input,
  Progress,
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage
} from '@/components/shadcn'

const schema = z.object({
  file: z
    .instanceof(FileList)
    .refine((file) => file?.length == 1, 'File is required.')
})
type FormSchema = z.infer<typeof schema>

function App() {
  const [progress, setProgress] = useState(0)

  const form = useForm<FormSchema>({
    resolver: zodResolver(schema)
  })
  const onSubmit = async (data: FormSchema) => {
    const formData = new FormData()
    formData.append('file', data.file[0])

    try {
      console.log(process.env.API_URL)
      console.log('upload file', formData)
    } catch (error) {
      console.error('Error uploading file:', error)
    }
  }

  return (
    <>
      <h1>Upload CSV</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-10">
          <FormField
            control={form.control}
            name="file"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Choose CSV</FormLabel>
                  <FormControl>
                    <Input 
                      type="file" 
                      accept=".csv"
                      onChange={(e) => field.onChange(e.target.files)}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <Progress value={progress} />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </>
  )
}

export default App

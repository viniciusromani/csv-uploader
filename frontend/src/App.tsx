import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, Progress, Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/shadcn';
import { LoadingButton } from './components/custom/loading-button';

const schema = z.object({
  file: z.instanceof(FileList).refine((file) => file?.length == 1, 'File is required.'),
});
type FormSchema = z.infer<typeof schema>;

function App() {
  const [progress, setProgress] = useState(0);

  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
  });
  const onSubmit = async (data: FormSchema) => {
    const formData = new FormData();
    formData.append('file', data.file[0]);

    try {
      console.log(process.env.API_URL);
      const response = await fetch(`${process.env.API_URL}/products/csv-import`, {
        method: 'POST',
        body: formData,
      });

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        let lines = buffer.split('\n');
        buffer = lines.pop()!;

        lines.forEach((line) => {
          if (line) setProgress(parseInt(line));
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <>
      <h1>Upload CSV</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-10">
          <FormField
            control={form.control}
            name="file"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Choose CSV</FormLabel>
                  <FormControl>
                    <Input type="file" accept=".csv" onChange={(e) => field.onChange(e.target.files)} ref={field.ref} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <Progress className="mt-2" value={progress} />
          <div className="text-right text-sm">{progress}%</div>
          <LoadingButton className="mt-8" type="submit" loading={progress > 0 && progress < 100}>
            Submit
          </LoadingButton>
        </form>
      </Form>
    </>
  );
}

export default App;

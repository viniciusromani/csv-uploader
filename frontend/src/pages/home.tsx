import { useRef, useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { getAPIURL } from '@/lib/config';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoadingButton, ErrorDialog } from '@/components/custom';
import { Button, Input, Progress } from '@/components/shadcn';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/shadcn';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/shadcn';

const schema = z.object({
  file: z
    .custom<FileList>((val) => val instanceof FileList, 'File is required')
    .refine((file) => file?.length === 1, 'File is required')
    .refine((file) => file[0]?.type === 'text/csv', 'Only CSV files are allowed'),
});
type FormSchema = z.infer<typeof schema>;

function Home() {
  const [progress, setProgress] = useState(0);
  const [totalLines, setTotalLines] = useState<number>(0);
  const [invalidLines, setInvalidLines] = useState<number[]>([]);
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
  });
  const reset = () => {
    setProgress(0);
    setInvalidLines([]);
    form.reset();
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };
  const onSubmit = async (data: FormSchema) => {
    const formData = new FormData();
    formData.append('file', data.file[0]);

    try {
      const { API_URL } = getAPIURL();
      const response = await fetch(`${API_URL}/products/csv-import`, {
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
          if (!line) return;

          if (line.startsWith('error:')) {
            const error = JSON.parse(line.split('error:')[1]);
            setError(error.message);
          } else if (line.startsWith('invalid:')) {
            const invalid = JSON.parse(line.split('invalid:')[1]);
            setInvalidLines(invalid);
          } else if (line.startsWith('total:')) {
            const total = line.split('total:')[1];
            setTotalLines(parseInt(total));
          } else {
            setProgress(parseInt(line));
          }
        });
      }
    } catch (error) {
      if (error instanceof Error) setError('Error processing stream: ' + error.message);
    }
  };

  return (
    <div className="container mx-auto my-8 space-y-8 flex-1 border-2 border-solid p-8 rounded-xl">
      <h1>Upload CSV</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
                      ref={(el) => {
                        field.ref(el);
                        inputRef.current = el;
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <Progress className="mt-2" value={progress} />
          <div className="text-right text-sm">{progress}%</div>
          <div className="mt-4 mb-4">
            <LoadingButton type="submit" loading={progress > 0 && progress < 100}>
              Submit
            </LoadingButton>
          </div>
          {progress == 100 && totalLines > 0 && (
            <div className="flex flex-col text-sm gap-2">
              <span className="text-green-700 font-bold">Upload successful</span>
              <span>Total Lines: {totalLines}</span>
              <span>Processed Lines: {totalLines - invalidLines.length}</span>
            </div>
          )}
          {invalidLines.length > 0 && (
            <div className="flex gap-2 text-yellow-600 text-sm mt-2">
              <TriangleAlert size={20} />
              <div className="flex gap-1">
                <span>Some lines were not processed because they are not valid.</span>
                <InvalidLinesDialog invalidLines={invalidLines} />
              </div>
            </div>
          )}
          {error.length > 0 && (
            <ErrorDialog open={true} message={error} setOpen={(_) => setError('')} onClose={reset} />
          )}
        </form>
      </Form>
    </div>
  );
}

function InvalidLinesDialog({ invalidLines }: { invalidLines: number[] }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="text-sm text-yellow-600 p-0 h-fit">
          Click here to check
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invalid Lines</DialogTitle>
          <DialogDescription>A line is only valid if it has a name and a price.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid grid-cols-10 gap-4">
            {invalidLines.map((invalidLine, index) => (
              <div key={index} className="text-sm">
                {invalidLine}
              </div>
            ))}
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default Home;
